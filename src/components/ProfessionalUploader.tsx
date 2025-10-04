import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Download, Send, Check, X } from 'lucide-react';
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
  const { setPlanets } = usePlanetsStore();
  const { toast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = text.split('\n').map((row) => row.split(','));
      setCsvData(rows);
      
      // Initialize mappings
      const initialMappings: CSVMapping[] = AVAILABLE_FIELDS.map((field) => ({
        field,
        position: -1,
        present: false,
      }));
      setMappings(initialMappings);
    };
    reader.readAsText(uploadedFile);
  };

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
      <h2 className="text-xl font-bold mb-6">Professional Mode</h2>

      <div className="space-y-6">
        {/* Upload Section */}
        <div className="space-y-3">
          <label className="block">
            <div className="glass-panel p-6 rounded-lg border-2 border-dashed border-muted hover:border-primary transition-colors cursor-pointer text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <div className="text-sm font-medium text-foreground">
                {file ? file.name : 'Click to upload CSV'}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                or drag and drop
              </div>
            </div>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadTemplate}
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Template CSV
          </Button>
        </div>

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

        {/* Mappings */}
        {csvData && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Column Mapping
            </h3>
            <div className="space-y-2">
              {mappings.map((mapping) => (
                <div
                  key={mapping.field}
                  className="glass-panel p-3 rounded-lg flex items-center gap-3"
                >
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
                  </label>
                  {mapping.present && (
                    <input
                      type="number"
                      min={0}
                      max={csvData[0].length - 1}
                      value={mapping.position >= 0 ? mapping.position : ''}
                      onChange={(e) =>
                        updateMapping(
                          mapping.field,
                          parseInt(e.target.value) || 0,
                          true
                        )
                      }
                      placeholder="Col #"
                      className="w-16 px-2 py-1 text-xs bg-background border border-border rounded focus:ring-1 focus:ring-primary"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit */}
        {csvData && (
          <Button
            onClick={handleSubmit}
            disabled={loading || !mappings.some((m) => m.present)}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {loading ? (
              <>Processing...</>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Analyze Data
              </>
            )}
          </Button>
        )}
      </div>
    </motion.div>
  );
};
