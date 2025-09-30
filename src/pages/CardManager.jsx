
import React, { useState } from "react";
import { HistoricalCard } from "@/api/entities";
import { UploadFile, ExtractDataFromUploadedFile } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Download, AlertCircle, CheckCircle, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export default function CardManager() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadResult(null);
    setPreviewData([]);
    setShowPreview(false);

    try {
      // Upload the file - pass the file directly
      const uploadResult = await UploadFile({ file: file });
      
      if (!uploadResult || !uploadResult.file_url) {
        throw new Error("Failed to upload file - no file URL returned");
      }

      // Extract data using the HistoricalCard schema
      const extractResult = await ExtractDataFromUploadedFile({
        file_url: uploadResult.file_url,
        json_schema: HistoricalCard.schema()
      });

      if (extractResult.status === "success" && extractResult.output) {
        const cards = Array.isArray(extractResult.output) ? extractResult.output : [extractResult.output];
        setPreviewData(cards);
        setShowPreview(true);
        setUploadResult({
          success: true,
          message: `Successfully parsed ${cards.length} cards from file`
        });
      } else {
        setUploadResult({
          success: false,
          message: extractResult.details || "Failed to parse file. Please check the format and encoding."
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      let errorMessage = "Error uploading file: " + error.message;
      
      // Provide specific guidance for common CSV issues
      if (error.message.includes("CSV Error") || error.message.includes("unicode") || error.message.includes("encoding")) {
        errorMessage += "\n\nTip: Try saving your CSV with UTF-8 encoding and avoid special characters like curly quotes. Use simple straight quotes only.";
      }
      
      setUploadResult({
        success: false,
        message: errorMessage
      });
    } finally {
      setIsUploading(false);
      // Reset the input so the same file can be uploaded again if needed
      event.target.value = '';
    }
  };

  const handleImportCards = async () => {
    if (previewData.length === 0) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      // Add is_archive: true to all cards
      const cardsToImport = previewData.map(card => ({
        ...card,
        is_archive: true
      }));

      await HistoricalCard.bulkCreate(cardsToImport);
      
      setImportResult({
        success: true,
        message: `Successfully imported ${cardsToImport.length} cards to the archive`
      });
      
      setPreviewData([]);
      setShowPreview(false);
    } catch (error) {
      setImportResult({
        success: false,
        message: "Error importing cards: " + error.message
      });
    }

    setIsImporting(false);
  };

  const clearAllCards = async () => {
    if (!confirm("Are you sure you want to delete ALL historical cards? This action cannot be undone.")) {
      return;
    }

    try {
      const existingCards = await HistoricalCard.list();
      for (const card of existingCards) {
        await HistoricalCard.delete(card.id);
      }
      
      setImportResult({
        success: true,
        message: "All cards have been deleted from the archive"
      });
    } catch (error) {
      setImportResult({
        success: false,
        message: "Error deleting cards: " + error.message
      });
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        title: "Example Document Title",
        source_type: "letter",
        sequence_number: 1,
        content: "Brief excerpt or description of the historical document",
        date: "Month Year",
        author: "Author Name",
        location: "City, State/Province",
        significance: "Why this document is historically important",
        image_url: "https://example.com/image.jpg",
        argument: "A",
        sub_argument: "E"
      },
      {
        title: "Another Document",
        source_type: "newspaper",
        sequence_number: 2,
        content: "Another example of document content",
        date: "Month Year", 
        author: "Author Name",
        location: "City, State/Province",
        significance: "Historical significance explanation",
        image_url: "https://example.com/image2.jpg",
        argument: "B",
        sub_argument: "P"
      }
    ];

    const jsonString = JSON.stringify(template, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'historical_cards_template.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up the URL object
  };

  const downloadCsvTemplate = () => {
    const csvContent = `title,source_type,sequence_number,content,date,author,location,significance,image_url,argument,sub_argument
"The Sugar Act of 1764","book",1,"An Act for granting certain Duties in the British Colonies and Plantations in America","April 5, 1764","British Parliament","London, England","First major tax imposed on the American colonies","","A","E"
"Virginia Stamp Act Resolutions","letter",2,"Resolved that the first adventurers and settlers brought with them all the liberties and immunities of Great Britain","May 30, 1765","Patrick Henry","Williamsburg, Virginia","First formal colonial resistance to the Stamp Act","","C","E"
"Boston Tea Party Account","letter",3,"About 7 o'clock this evening came on a number of people proceeded to Griffins wharf","December 16, 1773","George Robert Twelves Hewes","Boston, Massachusetts","Firsthand account of the most famous act of colonial resistance","","B","P"`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'historical_cards_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 revolution-accent rounded-lg flex items-center justify-center parchment-glow">
            <Upload className="w-6 h-6 text-yellow-100" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-yellow-100">Card Manager</h1>
            <p className="text-stone-400 mt-1">Import and manage historical documents</p>
          </div>
        </div>

        {/* Instructions */}
        <Card className="colonial-paper border-2 border-amber-600 mb-6">
          <CardHeader>
            <CardTitle className="text-stone-900">How to Import Cards</CardTitle>
          </CardHeader>
          <CardContent className="text-stone-700">
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Download the template file to see the required format</li>
              <li>Create your CSV, Excel, or JSON file with historical card data</li>
              <li>Upload the file using the button below</li>
              <li>Preview the parsed data and confirm import</li>
            </ol>
            
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-semibold mb-2 text-yellow-800">CSV Formatting Tips:</h4>
              <ul className="text-xs space-y-1 text-yellow-700">
                <li>• Save your CSV with UTF-8 encoding</li>
                <li>• Use straight quotes (") not curly quotes (“ ”)</li>
                <li>• Avoid apostrophes – use straight quotes instead (e.g., John's → Johns)</li>
                <li>• Keep content simple and avoid other special characters</li>
                <li>• Each row should be one card</li>
              </ul>
            </div>
            
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Fields:</h4>
              <ul className="text-xs space-y-1 text-stone-600 grid grid-cols-2">
                <li><strong>title:</strong> (Required) Name of document</li>
                <li><strong>source_type:</strong> (Required) "letter", "newspaper", or "book"</li>
                <li><strong>sequence_number:</strong> (Required) Number 1-20</li>
                <li><strong>content:</strong> (Required) Brief excerpt</li>
                <li><strong>date:</strong> (Required) e.g., "March 1765"</li>
                <li><strong>author:</strong> (Optional) Author or source</li>
                <li><strong>location:</strong> (Optional) Where it was created</li>
                <li><strong>significance:</strong> (Optional) Historical importance</li>
                <li><strong>image_url:</strong> (Optional) URL to image</li>
                <li><strong>argument:</strong> (Optional) "A", "B", or "C"</li>
                <li><strong>sub_argument:</strong> (Optional) "E", "P", or "S"</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Upload Section */}
          <Card className="colonial-paper border-2 border-stone-600">
            <CardHeader>
              <CardTitle className="text-stone-900 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Import Cards
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button
                  onClick={downloadTemplate}
                  variant="outline"
                  className="flex-1 border-amber-600 text-amber-700 hover:bg-amber-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  JSON Template
                </Button>
                
                <Button
                  onClick={downloadCsvTemplate}
                  variant="outline"
                  className="flex-1 border-green-600 text-green-700 hover:bg-green-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  CSV Template
                </Button>
              </div>
              
              <div className="relative">
                <input
                  type="file"
                  accept=".csv,.json,.xlsx,.xls"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button
                  disabled={isUploading}
                  className="w-full revolution-accent hover:bg-red-800 text-yellow-100"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-100 mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Card File
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="colonial-paper border-2 border-red-600">
            <CardHeader>
              <CardTitle className="text-stone-900 flex items-center gap-2 text-red-700">
                <Trash2 className="w-5 h-5" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-stone-600 mb-4">
                Clear all existing cards from the archive. This cannot be undone.
              </p>
              <Button
                onClick={clearAllCards}
                variant="destructive"
                className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete All Cards
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Upload Result */}
        {uploadResult && (
          <Alert className={`mb-6 ${uploadResult.success ? 'border-green-600' : 'border-red-600'}`}>
            {uploadResult.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertDescription>{uploadResult.message}</AlertDescription>
          </Alert>
        )}

        {/* Import Result */}
        {importResult && (
          <Alert className={`mb-6 ${importResult.success ? 'border-green-600' : 'border-red-600'}`}>
            {importResult.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertDescription>{importResult.message}</AlertDescription>
          </Alert>
        )}

        {/* Preview Section */}
        {showPreview && previewData.length > 0 && (
          <Card className="colonial-paper border-2 border-amber-600">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-stone-900">Preview Cards</CardTitle>
                <Badge className="bg-amber-600 text-white">
                  {previewData.length} cards
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto mb-4">
                <Textarea
                  value={JSON.stringify(previewData, null, 2)}
                  readOnly
                  className="font-mono text-xs bg-stone-50 border-stone-300"
                  rows={15}
                />
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={handleImportCards}
                  disabled={isImporting}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {isImporting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Importing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Import {previewData.length} Cards
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setShowPreview(false);
                    setPreviewData([]);
                  }}
                  variant="outline"
                  className="border-stone-600 text-stone-700"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
