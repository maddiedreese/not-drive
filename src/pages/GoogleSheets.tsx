import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  FileText, 
  Edit3, 
  Eye, 
  Plus, 
  Type, 
  Database, 
  Wrench, 
  Puzzle, 
  HelpCircle,
  Undo,
  Redo,
  Printer,
  Palette,
  ZoomIn,
  ZoomOut,
  DollarSign,
  Percent,
  Hash,
  Bold,
  Italic,
  Underline,
  MoreHorizontal,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ChevronDown,
  Grid3x3,
  Merge,
  Share,
  Star,
  Folder,
  MoreVertical
} from "lucide-react";
import { cn } from "@/lib/utils";

// Generate column labels (A, B, C, ..., Z, AA, AB, etc.)
const generateColumnLabel = (index: number): string => {
  let result = '';
  while (index >= 0) {
    result = String.fromCharCode(65 + (index % 26)) + result;
    index = Math.floor(index / 26) - 1;
  }
  return result;
};

// Cell formatting interface
interface CellFormat {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  textAlign?: 'left' | 'center' | 'right';
  backgroundColor?: string;
  textColor?: string;
  fontSize?: string;
}

// Generate grid data
const generateGrid = (rows: number, cols: number) => {
  const grid: { [key: string]: string } = {};
  
  // Add the example text from the screenshot
  grid['A1'] = 'Type "@" then a file name to insert a file smart chip';
  
  return grid;
};

// Generate initial formatting
const generateFormatting = () => {
  const formatting: { [key: string]: CellFormat } = {};
  return formatting;
};

const GoogleSheets = () => {
  const [gridData, setGridData] = useState(() => generateGrid(50, 20));
  const [cellFormatting, setCellFormatting] = useState(() => generateFormatting());
  const [selectedCell, setSelectedCell] = useState('A1');
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [history, setHistory] = useState<Array<{ data: any; formatting: any }>>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [zoom, setZoom] = useState(100);
  const [fileName, setFileName] = useState('Untitled spreadsheet');
  const inputRef = useRef<HTMLInputElement>(null);

  const rows = 50;
  const cols = 20;

  // Save state to history
  const saveToHistory = () => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ 
      data: { ...gridData }, 
      formatting: { ...cellFormatting } 
    });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingCell]);

  const handleCellClick = (row: number, col: number) => {
    const cellId = `${generateColumnLabel(col)}${row + 1}`;
    setSelectedCell(cellId);
    setEditingCell(null);
  };

  const handleCellDoubleClick = (row: number, col: number) => {
    const cellId = `${generateColumnLabel(col)}${row + 1}`;
    setEditingCell(cellId);
    setInputValue(gridData[cellId] || '');
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    if (editingCell) {
      setGridData(prev => ({ ...prev, [editingCell]: value }));
    }
  };

  const handleInputBlur = () => {
    setEditingCell(null);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveToHistory();
      setEditingCell(null);
    }
    if (e.key === 'Escape') {
      if (editingCell) {
        setGridData(prev => ({ ...prev, [editingCell]: gridData[editingCell] || '' }));
      }
      setEditingCell(null);
    }
  };

  // Toolbar functionality
  const handleUndo = () => {
    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1];
      setGridData(previousState.data);
      setCellFormatting(previousState.formatting);
      setHistoryIndex(historyIndex - 1);
      toast.success("Undo successful");
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setGridData(nextState.data);
      setCellFormatting(nextState.formatting);
      setHistoryIndex(historyIndex + 1);
      toast.success("Redo successful");
    }
  };

  const handlePrint = () => {
    window.print();
    toast.success("Print dialog opened");
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(zoom + 25, 200);
    setZoom(newZoom);
    toast.success(`Zoom: ${newZoom}%`);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom - 25, 50);
    setZoom(newZoom);
    toast.success(`Zoom: ${newZoom}%`);
  };

  const toggleCellFormat = (formatType: keyof CellFormat, value?: any) => {
    saveToHistory();
    setCellFormatting(prev => ({
      ...prev,
      [selectedCell]: {
        ...prev[selectedCell],
        [formatType]: value !== undefined ? value : !prev[selectedCell]?.[formatType]
      }
    }));
    toast.success(`${formatType} ${value !== undefined ? 'applied' : 'toggled'}`);
  };

  const handleFormatCurrency = () => {
    const cellValue = gridData[selectedCell];
    if (cellValue && !isNaN(Number(cellValue))) {
      setGridData(prev => ({
        ...prev,
        [selectedCell]: `$${Number(cellValue).toFixed(2)}`
      }));
      saveToHistory();
      toast.success("Currency format applied");
    }
  };

  const handleFormatPercent = () => {
    const cellValue = gridData[selectedCell];
    if (cellValue && !isNaN(Number(cellValue))) {
      setGridData(prev => ({
        ...prev,
        [selectedCell]: `${(Number(cellValue) * 100).toFixed(2)}%`
      }));
      saveToHistory();
      toast.success("Percentage format applied");
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Share link copied to clipboard!");
  };

  const handleStar = () => {
    toast.success("Spreadsheet starred!");
  };

  const getCurrentCellFormat = (): CellFormat => {
    return cellFormatting[selectedCell] || {};
  };

  const currentFormat = getCurrentCellFormat();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="flex items-center px-6 py-3">
          <div className="flex items-center gap-2 flex-1">
            <div className="w-10 h-10 bg-[#0f9d58] rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 bg-white rounded grid grid-cols-3 gap-0.5 p-1">
                <div className="bg-[#0f9d58] rounded-sm"></div>
                <div className="bg-[#0f9d58] rounded-sm"></div>
                <div className="bg-[#0f9d58] rounded-sm"></div>
                <div className="bg-[#0f9d58] rounded-sm"></div>
                <div className="bg-[#0f9d58] rounded-sm"></div>
                <div className="bg-[#0f9d58] rounded-sm"></div>
              </div>
            </div>
            <div className="flex flex-col">
              <input 
                className="text-lg font-normal text-gray-700 bg-transparent border-none outline-none"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                onBlur={() => toast.success("Spreadsheet renamed")}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleStar}>
              <Star className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => toast.success("Move to folder")}>
              <Folder className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => toast.success("More options")}>
              <MoreVertical className="w-4 h-4" />
            </Button>
            <Button className="bg-[#1a73e8] hover:bg-[#1557b0] text-white px-6" onClick={handleShare}>
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
              M
            </div>
          </div>
        </div>
      </header>

      {/* Menu Bar */}
      <div className="border-b border-gray-200 bg-white px-6 py-2">
        <div className="flex items-center gap-6 text-sm bg-gray-100 rounded-full px-4 py-2 w-fit">
          <button className="text-gray-700 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-200 transition-colors">File</button>
          <button className="text-gray-700 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-200 transition-colors">Edit</button>
          <button className="text-gray-700 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-200 transition-colors">View</button>
          <button className="text-gray-700 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-200 transition-colors">Insert</button>
          <button className="text-gray-700 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-200 transition-colors">Format</button>
          <button className="text-gray-700 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-200 transition-colors">Data</button>
          <button className="text-gray-700 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-200 transition-colors">Tools</button>
          <button className="text-gray-700 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-200 transition-colors">Extensions</button>
          <button className="text-gray-700 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-200 transition-colors">Help</button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="border-b border-gray-200 bg-white px-6 py-2">
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handlePrint} title="Print">
            <Printer className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => toast.success("Paint format")} title="Paint format">
            <Palette className="w-4 h-4" />
          </Button>
          
          <div className="w-px h-6 bg-gray-300 mx-2"></div>
          
          <Button variant="ghost" size="sm" className="text-xs px-2" title="Zoom">
            {zoom}%
          </Button>
          <Button variant="ghost" size="sm" onClick={handleZoomOut} title="Zoom out">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleZoomIn} title="Zoom in">
            <ZoomIn className="w-4 h-4" />
          </Button>
          
          <div className="w-px h-6 bg-gray-300 mx-2"></div>
          
          <Button variant="ghost" size="sm" onClick={handleFormatCurrency} title="Format as currency">
            <DollarSign className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleFormatPercent} title="Format as percent">
            <Percent className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => toast.success("More number formats")} title="More number formats">
            <Hash className="w-4 h-4" />
          </Button>
          
          <div className="w-px h-6 bg-gray-300 mx-2"></div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => toggleCellFormat('bold')}
            className={currentFormat.bold ? 'bg-gray-200' : ''}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => toggleCellFormat('italic')}
            className={currentFormat.italic ? 'bg-gray-200' : ''}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => toggleCellFormat('underline')}
            className={currentFormat.underline ? 'bg-gray-200' : ''}
            title="Underline"
          >
            <Underline className="w-4 h-4" />
          </Button>
          
          <div className="w-px h-6 bg-gray-300 mx-2"></div>
          
          <Button variant="ghost" size="sm" onClick={() => toggleCellFormat('textColor', '#000000')} title="Text color">
            <div className="w-4 h-4 bg-black rounded-sm"></div>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => toggleCellFormat('backgroundColor', '#ffff00')} title="Fill color">
            <div className="w-4 h-4 border border-gray-400 rounded-sm bg-yellow-200"></div>
          </Button>
          
          <div className="w-px h-6 bg-gray-300 mx-2"></div>
          
          <Button variant="ghost" size="sm" onClick={() => toast.success("Borders applied")} title="Borders">
            <Grid3x3 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => toast.success("Merge cells")} title="Merge cells">
            <Merge className="w-4 h-4" />
          </Button>
          
          <div className="w-px h-6 bg-gray-300 mx-2"></div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => toggleCellFormat('textAlign', 'left')}
            className={currentFormat.textAlign === 'left' ? 'bg-gray-200' : ''}
            title="Align left"
          >
            <AlignLeft className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => toggleCellFormat('textAlign', 'center')}
            className={currentFormat.textAlign === 'center' ? 'bg-gray-200' : ''}
            title="Align center"
          >
            <AlignCenter className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => toggleCellFormat('textAlign', 'right')}
            className={currentFormat.textAlign === 'right' ? 'bg-gray-200' : ''}
            title="Align right"
          >
            <AlignRight className="w-4 h-4" />
          </Button>
          
          <div className="w-px h-6 bg-gray-300 mx-2"></div>
          
          <Button variant="ghost" size="sm" onClick={() => toast.success("More options")} title="More options">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Name Box and Formula Bar */}
      <div className="border-b border-gray-200 bg-white px-6 py-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-600 font-medium w-12">{selectedCell}</div>
            <Button variant="ghost" size="sm">
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex-1">
            <Input 
              className="border-0 focus-visible:ring-0 text-sm"
              placeholder="Start typing..."
              value={editingCell === selectedCell ? inputValue : gridData[selectedCell] || ''}
              onChange={(e) => {
                if (editingCell === selectedCell) {
                  handleInputChange(e.target.value);
                } else {
                  setEditingCell(selectedCell);
                  setInputValue(e.target.value);
                  handleInputChange(e.target.value);
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Spreadsheet Grid */}
      <div className="flex-1 overflow-auto bg-white" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}>
        <div className="inline-block min-w-full">
          <table className="border-collapse">
            <thead>
              <tr>
                <th className="w-12 h-8 bg-gray-50 border border-gray-300 text-center text-xs text-gray-600"></th>
                {Array.from({ length: cols }, (_, i) => (
                  <th key={i} className="min-w-[100px] h-8 bg-gray-50 border border-gray-300 text-center text-xs font-medium text-gray-600">
                    {generateColumnLabel(i)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rows }, (_, row) => (
                <tr key={row}>
                  <td className="w-12 h-6 bg-gray-50 border border-gray-300 text-center text-xs text-gray-600 font-medium">
                    {row + 1}
                  </td>
                  {Array.from({ length: cols }, (_, col) => {
                    const cellId = `${generateColumnLabel(col)}${row + 1}`;
                    const isSelected = selectedCell === cellId;
                    const isEditing = editingCell === cellId;
                    const format = cellFormatting[cellId] || {};
                    return (
                      <td 
                        key={col}
                        className={cn(
                          "min-w-[100px] h-6 border border-gray-300 cursor-cell relative",
                          isSelected && "ring-2 ring-blue-500 bg-blue-50"
                        )}
                        style={{
                          backgroundColor: format.backgroundColor || (isSelected ? '#e3f2fd' : 'transparent'),
                          color: format.textColor || '#000',
                        }}
                        onClick={() => handleCellClick(row, col)}
                        onDoubleClick={() => handleCellDoubleClick(row, col)}
                      >
                        {isEditing ? (
                          <input
                            ref={inputRef}
                            className="w-full h-full px-2 text-sm border-none outline-none bg-transparent"
                            value={inputValue}
                            onChange={(e) => handleInputChange(e.target.value)}
                            onBlur={handleInputBlur}
                            onKeyDown={handleInputKeyDown}
                          />
                        ) : (
                          <div 
                            className="px-2 text-sm h-full flex items-center"
                            style={{
                              fontWeight: format.bold ? 'bold' : 'normal',
                              fontStyle: format.italic ? 'italic' : 'normal',
                              textDecoration: format.underline ? 'underline' : 'none',
                              textAlign: format.textAlign || 'left',
                            }}
                          >
                            {gridData[cellId] || ''}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="border-t border-gray-200 bg-white px-6 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="text-xs bg-white border border-gray-300">
              Sheet1
            </Button>
            <Button variant="ghost" size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="text-xs text-gray-500">
            All changes saved in Drive
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleSheets;