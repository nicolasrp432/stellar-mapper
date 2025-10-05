import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Download, Send, Check, X, FileText, AlertCircle, CheckCircle, Info } from 'lucide-react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { usePlanetsStore } from '@/hooks/usePlanetsStore';
import { CSVMapping, AnalyzeResponse } from '@/types/exoplanet';
import { useToast } from '@/hooks/use-toast';

const AVAILABLE_FIELDS = [
  'period',
  'radius',
  'distance',
  'depth',
  'duration',
  'snr',
];

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  rowCount: number;
  columnCount: number;
}

export const ProfessionalUploader = ({ 
  endpoint = '/analyze', 
  onDataUploaded 
}: { 
  endpoint?: string;
  onDataUploaded?: () => void;
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<string[][] | null>(null);
  const [mappings, setMappings] = useState<CSVMapping[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setPlanets } = usePlanetsStore();
  const { toast } = useToast();

  // CSV validation function
  const validateCSV = useCallback((rows: string[][]): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (rows.length < 2) {
      errors.push('CSV must contain at least a header row and one data row');
    }
    
    if (rows[0].length < 3) {
      errors.push('CSV must contain at least 3 columns');
    }
    
    // Check for empty cells
    let emptyCells = 0;
    rows.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell.trim() === '' && rowIndex > 0) {
          emptyCells++;
        }
      });
    });
    
    if (emptyCells > 0) {
      warnings.push(`Found ${emptyCells} empty cells in data rows`);
    }
    
    // Check for numeric columns
    const numericColumns = [];
    for (let col = 0; col < rows[0].length; col++) {
      let isNumeric = true;
      for (let row = 1; row < Math.min(rows.length, 6); row++) {
        const value = rows[row][col];
        if (value && isNaN(Number(value))) {
          isNumeric = false;
          break;
        }
      }
      if (isNumeric) numericColumns.push(col);
    }
    
    if (numericColumns.length < 2) {
      warnings.push('Expected more numeric columns for exoplanet analysis');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      rowCount: rows.length - 1, // Exclude header
      columnCount: rows[0].length
    };
  }, []);

  const processFile = useCallback((uploadedFile: File) => {
    setFile(uploadedFile);
    setUploadProgress(0);
    
    const reader = new FileReader();
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        setUploadProgress((e.loaded / e.total) * 100);
      }
    };
    
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = text.split('\n')
        .map((row) => row.split(',').map(cell => cell.trim()))
        .filter(row => row.some(cell => cell !== '')); // Remove empty rows
      
      setCsvData(rows);
      
      // Validate CSV
      const validationResult = validateCSV(rows);
      setValidation(validationResult);

      // If CSV is invalid, use a small simulated dataset and mark as uploaded
      if (!validationResult.isValid) {
        const simulatedPlanets = [
          { id: 'sim-1', name: 'Kepler-22b', probability: 0.87, isExoplanet: true, features: { radius: 2.4, period: 290, distance: 8.5 } },
          { id: 'sim-2', name: 'KOI-351c', probability: 0.23, isExoplanet: false, features: { radius: 1.2, period: 331.6, distance: 7.2 } },
        ];
        setPlanets(simulatedPlanets);
        onDataUploaded?.();
        toast({
          title: 'CSV inválido — usando datos simulados',
          description: `Se cargó un conjunto de ${simulatedPlanets.length} candidatos para visualización`,
        });
      }
      
      // Auto-detect column mappings
      const headers = rows[0].map(h => h.toLowerCase());
      const initialMappings: CSVMapping[] = AVAILABLE_FIELDS.map((field) => {
        const position = headers.findIndex(h => 
          h.includes(field) || 
          (field === 'radius' && h.includes('size')) ||
          (field === 'distance' && h.includes('dist')) ||
          (field === 'period' && h.includes('orbital'))
        );
        
        return {
          field,
          position: position >= 0 ? position : -1,
          present: position >= 0,
        };
      });
      setMappings(initialMappings);
      setUploadProgress(100);
      
      if (validationResult.isValid) {
        toast({
          title: 'File uploaded successfully',
          description: `Processed ${validationResult.rowCount} rows with ${validationResult.columnCount} columns`,
        });
      }
    };
    
    reader.onerror = () => {
      toast({
        title: 'Upload failed',
        description: 'Could not read the file. Please try again.',
        variant: 'destructive',
      });
    };
    
    reader.readAsText(uploadedFile);
  }, [validateCSV, toast]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;
    
    if (!uploadedFile.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a CSV file',
        variant: 'destructive',
      });
      return;
    }
    
    processFile(uploadedFile);
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const csvFile = files.find(file => file.name.toLowerCase().endsWith('.csv'));
    
    if (!csvFile) {
      toast({
        title: 'Invalid file type',
        description: 'Please drop a CSV file',
        variant: 'destructive',
      });
      return;
    }
    
    processFile(csvFile);
  }, [processFile, toast]);

  const updateMapping = (field: string, position: number, present: boolean) => {
    setMappings((prev) =>
      prev.map((m) => (m.field === field ? { ...m, position, present } : m))
    );
  };

  const handleSubmit = async () => {
    if (!csvData) return;

    setLoading(true);
    try {
      const response = await axios.post<AnalyzeResponse>(endpoint, {
        arrayPosicion: mappings,
        csvData: csvData,
      });

      setPlanets(response.data.planets || []);
      onDataUploaded?.();
      toast({
        title: 'Analysis Complete',
        description: `Detected ${response.data.planets?.length || 0} exoplanet candidates.`,
      });
    } catch (error) {
      console.error('Error submitting data:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Could not process the data. Please check your endpoint and data format.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const template = `time,flux,period,radius,distance,depth,duration,snr
0,1.0,365,1.0,1.0,100,3.0,5.0
1,0.9999,730,1.5,2.0,200,4.0,7.0
2,1.0001,182.5,0.8,0.5,50,2.0,4.0`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exoplanet_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -300 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed left-4 top-4 bottom-4 w-96 glass-panel p-6 overflow-y-auto z-40"
    >
      <div className="flex items-center gap-3 mb-6">
        <FileText className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-bold">Professional Mode</h2>
      </div>

      <div className="space-y-6">
        {/* Enhanced Upload Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Data Upload
            </h3>
            <p className="text-xs text-muted-foreground">
              Upload your exoplanet candidate data for analysis
            </p>
          </div>
          
          <label className="block">
            <div 
              className={`glass-panel p-6 rounded-lg border-2 border-dashed transition-all duration-200 cursor-pointer text-center ${
                isDragOver 
                  ? 'border-primary bg-primary/5 scale-105' 
                  : file 
                    ? 'border-green-500 bg-green-500/5' 
                    : 'border-muted hover:border-primary hover:bg-primary/5'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <motion.div
                animate={{ 
                  scale: isDragOver ? 1.1 : 1,
                  rotate: isDragOver ? 5 : 0 
                }}
                transition={{ duration: 0.2 }}
              >
                {file ? (
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                ) : (
                  <Upload className={`h-8 w-8 mx-auto mb-2 transition-colors ${
                    isDragOver ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                )}
              </motion.div>
              
              <div className="text-sm font-medium text-foreground">
                {file ? file.name : isDragOver ? 'Drop CSV file here' : 'Click to upload CSV'}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {file ? `${(file.size / 1024).toFixed(1)} KB` : 'or drag and drop'}
              </div>
              
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-3">
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <motion.div 
                      className="bg-primary h-1.5 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Uploading... {uploadProgress.toFixed(0)}%
                  </div>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadTemplate}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Template
            </Button>
            {file && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFile(null);
                  setCsvData(null);
                  setMappings([]);
                  setValidation(null);
                  setUploadProgress(0);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="px-3"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Validation Results */}
        <AnimatePresence>
          {validation && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Validation Results
              </h3>
              
              <div className={`glass-panel p-4 rounded-lg border-l-4 ${
                validation.isValid ? 'border-green-500' : 'border-red-500'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {validation.isValid ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${
                    validation.isValid ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {validation.isValid ? 'Valid CSV' : 'Validation Failed'}
                  </span>
                </div>
                
                <div className="text-xs text-muted-foreground mb-3">
                  {validation.rowCount} rows • {validation.columnCount} columns
                </div>
                
                {validation.errors.length > 0 && (
                  <div className="space-y-1 mb-3">
                    {validation.errors.map((error, index) => (
                      <div key={index} className="flex items-start gap-2 text-xs text-red-400">
                        <X className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{error}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {validation.warnings.length > 0 && (
                  <div className="space-y-1">
                    {validation.warnings.map((warning, index) => (
                      <div key={index} className="flex items-start gap-2 text-xs text-yellow-400">
                        <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{warning}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Preview */}
        {csvData && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Data Preview
            </h3>
            <div className="glass-panel p-3 rounded-lg overflow-x-auto max-h-32">
              <table className="text-xs w-full">
                <thead>
                  <tr className="text-muted-foreground">
                    {csvData[0]?.map((header, i) => (
                      <th key={i} className="px-2 py-1 text-left">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvData.slice(1, 4).map((row, i) => (
                    <tr key={i} className="border-t border-border">
                      {row.map((cell, j) => (
                        <td key={j} className="px-2 py-1">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Enhanced Column Mapping */}
        <AnimatePresence>
          {csvData && validation?.isValid && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Column Mapping
                </h3>
                <p className="text-xs text-muted-foreground">
                  Map your CSV columns to exoplanet parameters
                </p>
              </div>
              
              <div className="space-y-2">
                {mappings.map((mapping, index) => (
                  <motion.div
                    key={mapping.field}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`glass-panel p-3 rounded-lg transition-all duration-200 ${
                      mapping.present ? 'border border-primary/30 bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={mapping.present}
                        onChange={(e) =>
                          updateMapping(mapping.field, mapping.position, e.target.checked)
                        }
                        className="h-4 w-4 rounded border-muted bg-background text-primary focus:ring-primary"
                      />
                      <label className="text-sm font-medium flex-1 capitalize">
                        {mapping.field}
                        {mapping.field === 'period' && <span className="text-xs text-muted-foreground ml-1">(days)</span>}
                        {mapping.field === 'radius' && <span className="text-xs text-muted-foreground ml-1">(R⊕)</span>}
                        {mapping.field === 'distance' && <span className="text-xs text-muted-foreground ml-1">(AU)</span>}
                      </label>
                      
                      <AnimatePresence>
                        {mapping.present && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex items-center gap-2"
                          >
                            <select
                              value={mapping.position >= 0 ? mapping.position : ''}
                              onChange={(e) =>
                                updateMapping(
                                  mapping.field,
                                  parseInt(e.target.value) || 0,
                                  true
                                )
                              }
                              className="w-24 px-2 py-1 text-xs bg-background border border-border rounded focus:ring-1 focus:ring-primary"
                            >
                              <option value="">Select</option>
                              {csvData[0].map((header, colIndex) => (
                                <option key={colIndex} value={colIndex}>
                                  {header || `Col ${colIndex + 1}`}
                                </option>
                              ))}
                            </select>
                            {mapping.position >= 0 && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="flex items-center"
                              >
                                <Check className="h-3 w-3 text-green-500" />
                              </motion.div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Mapping Summary */}
              <div className="glass-panel p-3 rounded-lg bg-muted/20">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Mapped fields:</span>
                  <span className={`font-medium ${
                    mappings.filter(m => m.present && m.position >= 0).length >= 3 
                      ? 'text-green-500' 
                      : 'text-yellow-500'
                  }`}>
                    {mappings.filter(m => m.present && m.position >= 0).length} / {mappings.length}
                  </span>
                </div>
                {mappings.filter(m => m.present && m.position >= 0).length < 3 && (
                  <div className="text-xs text-yellow-400 mt-1">
                    Map at least 3 fields for analysis
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Submit Section */}
        <AnimatePresence>
          {csvData && validation?.isValid && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Analysis
                </h3>
                <p className="text-xs text-muted-foreground">
                  Ready to analyze your exoplanet candidates
                </p>
              </div>
              
              <Button
                onClick={handleSubmit}
                disabled={loading || mappings.filter(m => m.present && m.position >= 0).length < 3}
                className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50"
                size="lg"
              >
                {loading ? (
                  <motion.div
                    className="flex items-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.div
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Processing Analysis...
                  </motion.div>
                ) : (
                  <motion.div
                    className="flex items-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Send className="h-4 w-4" />
                    Analyze {validation.rowCount} Candidates
                  </motion.div>
                )}
              </Button>
              
              {mappings.filter(m => m.present && m.position >= 0).length < 3 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-panel p-3 rounded-lg border-l-4 border-yellow-500"
                >
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-yellow-500 font-medium">
                      Incomplete Mapping
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Please map at least 3 fields to proceed with analysis
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
