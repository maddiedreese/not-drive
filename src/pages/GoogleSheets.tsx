import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

// Generate grid data
const generateGrid = (rows: number, cols: number) => {
  const grid: { [key: string]: string } = {};
  
  // Add the example text from the screenshot
  grid['A1'] = 'Type "@" then a file name to insert a file smart chip';
  
  return grid;
};

const GoogleSheets = () => {
  const [gridData, setGridData] = useState(() => generateGrid(50, 20));
  const [selectedCell, setSelectedCell] = useState('A1');
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const rows = 50;
  const cols = 20;

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
      setEditingCell(null);
    }
    if (e.key === 'Escape') {
      if (editingCell) {
        setGridData(prev => ({ ...prev, [editingCell]: gridData[editingCell] || '' }));
      }
      setEditingCell(null);
    }
  };

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
              <h1 className="text-lg font-normal text-gray-700">Untitled spreadsheet</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Star className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Folder className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
            <Button className="bg-[#1a73e8] hover:bg-[#1557b0] text-white px-6">
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
        <div className="flex items-center gap-6 text-sm">
          <button className="text-gray-700 hover:text-gray-900">File</button>
          <button className="text-gray-700 hover:text-gray-900">Edit</button>
          <button className="text-gray-700 hover:text-gray-900">View</button>
          <button className="text-gray-700 hover:text-gray-900">Insert</button>
          <button className="text-gray-700 hover:text-gray-900">Format</button>
          <button className="text-gray-700 hover:text-gray-900">Data</button>
          <button className="text-gray-700 hover:text-gray-900">Tools</button>
          <button className="text-gray-700 hover:text-gray-900">Extensions</button>
          <button className="text-gray-700 hover:text-gray-900">Help</button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="border-b border-gray-200 bg-white px-6 py-2">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm">
            <Undo className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Redo className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Printer className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Palette className="w-4 h-4" />
          </Button>
          
          <div className="w-px h-6 bg-gray-300 mx-2"></div>
          
          <Button variant="ghost" size="sm" className="text-xs px-2">
            100%
          </Button>
          <Button variant="ghost" size="sm">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <ZoomIn className="w-4 h-4" />
          </Button>
          
          <div className="w-px h-6 bg-gray-300 mx-2"></div>
          
          <Button variant="ghost" size="sm">
            <DollarSign className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Percent className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Hash className="w-4 h-4" />
          </Button>
          
          <div className="w-px h-6 bg-gray-300 mx-2"></div>
          
          <Button variant="ghost" size="sm">
            <Bold className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Italic className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Underline className="w-4 h-4" />
          </Button>
          
          <div className="w-px h-6 bg-gray-300 mx-2"></div>
          
          <Button variant="ghost" size="sm">
            <div className="w-4 h-4 bg-black rounded-sm"></div>
          </Button>
          <Button variant="ghost" size="sm">
            <div className="w-4 h-4 border border-gray-400 rounded-sm"></div>
          </Button>
          
          <div className="w-px h-6 bg-gray-300 mx-2"></div>
          
          <Button variant="ghost" size="sm">
            <Grid3x3 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Merge className="w-4 h-4" />
          </Button>
          
          <div className="w-px h-6 bg-gray-300 mx-2"></div>
          
          <Button variant="ghost" size="sm">
            <AlignLeft className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <AlignCenter className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <AlignRight className="w-4 h-4" />
          </Button>
          
          <div className="w-px h-6 bg-gray-300 mx-2"></div>
          
          <Button variant="ghost" size="sm">
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
      <div className="flex-1 overflow-auto bg-white">
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
                    return (
                      <td 
                        key={col}
                        className={cn(
                          "min-w-[100px] h-6 border border-gray-300 cursor-cell relative",
                          isSelected && "ring-2 ring-blue-500 bg-blue-50"
                        )}
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
                          <div className="px-2 text-sm h-full flex items-center">
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