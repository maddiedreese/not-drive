import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
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
  Share2,
  Star,
  Folder,
  MoreVertical,
  Download,
  Save,
  Copy,
  Scissors,
  Clipboard,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Calculator,
  Settings,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

// Common colors for the color picker
const commonColors = [
  '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
  '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
  '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc',
  '#dd7e6b', '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#a4c2f4', '#9fc5e8', '#b4a7d6', '#d5a6bd',
  '#cc4125', '#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6fa8dc', '#6fc3df', '#8e7cc3', '#c27ba0',
  '#a61c00', '#cc0000', '#e69138', '#f1c232', '#6aa84f', '#45818e', '#3c78d8', '#3d85c6', '#674ea7', '#a64d79'
];

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

// Generate column labels (A, B, C, ..., Z, AA, AB, etc.)
const generateColumnLabel = (index: number): string => {
  let result = '';
  while (index >= 0) {
    result = String.fromCharCode(65 + (index % 26)) + result;
    index = Math.floor(index / 26) - 1;
  }
  return result;
};

const SpreadsheetEditor = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [gridData, setGridData] = useState<{ [key: string]: string }>({});
  const [cellFormatting, setCellFormatting] = useState<{ [key: string]: CellFormat }>({});
  const [selectedCell, setSelectedCell] = useState('A1');
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [history, setHistory] = useState<Array<{ data: any; formatting: any }>>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [zoom, setZoom] = useState(100);
  const [fileName, setFileName] = useState('Untitled spreadsheet');
  const [textColorOpen, setTextColorOpen] = useState(false);
  const [fillColorOpen, setFillColorOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const rows = 50;
  const cols = 20;

  // Load spreadsheet data
  useEffect(() => {
    if (!documentId || !user) return;
    
    const loadSpreadsheet = async () => {
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('id', documentId)
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setFileName(data.name);
          setGridData((data.spreadsheet_data as any) || {});
          setCellFormatting((data.spreadsheet_formatting as any) || {});
        }
      } catch (error: any) {
        toast.error('Failed to load spreadsheet');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadSpreadsheet();
  }, [documentId, user, navigate]);

  // Auto-save functionality
  useEffect(() => {
    if (!documentId || !user || loading) return;

    const saveTimeout = setTimeout(async () => {
      setSaving(true);
      try {
        const { error } = await supabase
          .from('documents')
          .update({
            name: fileName,
            spreadsheet_data: gridData as any,
            spreadsheet_formatting: cellFormatting as any,
            updated_at: new Date().toISOString()
          })
          .eq('id', documentId)
          .eq('user_id', user.id);

        if (error) throw error;
      } catch (error: any) {
        toast.error('Failed to save spreadsheet');
      } finally {
        setSaving(false);
      }
    }, 1000);

    return () => clearTimeout(saveTimeout);
  }, [gridData, cellFormatting, fileName, documentId, user, loading]);

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
    const shareUrl = `${window.location.origin}/spreadsheet/${documentId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Share link copied to clipboard!");
  };

  const handleStar = () => {
    toast.success("Spreadsheet starred!");
  };

  // Menu functionality (same as before)
  const handleFileAction = (action: string) => {
    switch(action) {
      case 'new':
        navigate('/sheets');
        break;
      case 'save':
        toast.success("Spreadsheet saved!");
        break;
      case 'print':
        window.print();
        break;
      default:
        toast.success(`${action} action triggered`);
    }
  };

  const handleEditAction = (action: string) => {
    switch(action) {
      case 'undo':
        handleUndo();
        break;
      case 'redo':
        handleRedo();
        break;
      case 'cut':
        navigator.clipboard.writeText(gridData[selectedCell] || '');
        setGridData(prev => ({ ...prev, [selectedCell]: '' }));
        toast.success("Cut to clipboard");
        break;
      case 'copy':
        navigator.clipboard.writeText(gridData[selectedCell] || '');
        toast.success("Copied to clipboard");
        break;
      case 'paste':
        navigator.clipboard.readText().then(text => {
          setGridData(prev => ({ ...prev, [selectedCell]: text }));
          toast.success("Pasted from clipboard");
        });
        break;
      default:
        toast.success(`${action} action triggered`);
    }
  };

  const handleViewAction = (action: string) => {
    toast.success(`${action} action triggered`);
  };

  const handleInsertAction = (action: string) => {
    toast.success(`${action} action triggered`);
  };

  const handleFormatAction = (action: string) => {
    switch(action) {
      case 'bold':
        toggleCellFormat('bold');
        break;
      case 'italic':
        toggleCellFormat('italic');
        break;
      case 'underline':
        toggleCellFormat('underline');
        break;
      default:
        toast.success(`${action} action triggered`);
    }
  };

  const handleDataAction = (action: string) => {
    toast.success(`${action} action triggered`);
  };

  const handleToolsAction = (action: string) => {
    toast.success(`${action} action triggered`);
  };

  const getCurrentCellFormat = (): CellFormat => {
    return cellFormatting[selectedCell] || {};
  };

  const handleColorSelect = (color: string, type: 'textColor' | 'backgroundColor') => {
    saveToHistory();
    setCellFormatting(prev => ({
      ...prev,
      [selectedCell]: {
        ...prev[selectedCell],
        [type]: color
      }
    }));
    toast.success(`${type === 'textColor' ? 'Text' : 'Fill'} color applied`);
    
    // Close the color picker
    if (type === 'textColor') {
      setTextColorOpen(false);
    } else {
      setFillColorOpen(false);
    }
  };

  const ColorPicker = ({ onColorSelect, type }: { onColorSelect: (color: string) => void, type: 'text' | 'fill' }) => (
    <div className="w-64 p-4 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
      <div className="mb-3">
        <h4 className="text-sm font-medium text-gray-700 mb-2">{type === 'text' ? 'Text color' : 'Fill color'}</h4>
        <div className="grid grid-cols-10 gap-1">
          {commonColors.map((color) => (
            <button
              key={color}
              className="w-6 h-6 border border-gray-300 rounded hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
              onClick={() => onColorSelect(color)}
              title={color}
            />
          ))}
        </div>
      </div>
      {type === 'fill' && (
        <button
          className="w-full mt-2 px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded border"
          onClick={() => onColorSelect('transparent')}
        >
          No fill
        </button>
      )}
    </div>
  );

  const currentFormat = getCurrentCellFormat();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">Loading spreadsheet...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="flex items-center px-6 py-3">
          <div className="flex items-center gap-2 flex-1">
            <div className="w-10 h-10 flex items-center justify-center">
              <img 
                src="/lovable-uploads/fc341c1a-c84e-4871-ba13-962c23a89cea.png" 
                alt="Google Sheets" 
                className="w-8 h-8 cursor-pointer hover:bg-gray-100 rounded p-1" 
                onClick={() => navigate("/sheets")}
              />
            </div>
            <div className="flex flex-col">
              <input 
                className="text-lg font-normal text-gray-700 bg-transparent border-none outline-none"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                onBlur={() => toast.success("Spreadsheet renamed")}
              />
              {saving && <div className="text-xs text-gray-500">Saving...</div>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-gray-100 rounded-full" onClick={handleStar}>
              <Star className="w-4 h-4 text-gray-600" />
            </Button>
            <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-gray-100 rounded-full" onClick={() => toast.success("Move to folder")}>
              <Folder className="w-4 h-4 text-gray-600" />
            </Button>
            <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-gray-100 rounded-full" onClick={handleShare}>
              <Share2 className="w-4 h-4 text-gray-600" />
            </Button>
            <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-gray-100 rounded-full" onClick={() => toast.success("More options")}>
              <MoreVertical className="w-4 h-4 text-gray-600" />
            </Button>
            
            <div className="flex items-center bg-[#c8e6f5] hover:bg-[#b8d6e5] rounded-full overflow-hidden ml-2">
              <Button 
                className="bg-transparent hover:bg-transparent text-black px-4 py-2 font-medium text-sm flex items-center space-x-2 rounded-none"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </Button>
            </div>
            
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-medium text-sm ml-2">
              {user?.email?.[0]?.toUpperCase() || "U"}
            </div>
          </div>
        </div>
      </header>

      {/* Menu Bar - Same as GoogleSheets but with updated handlers */}
      <div className="border-b border-gray-200 bg-white px-6 py-2">
        <div className="flex items-center gap-1 text-sm">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-gray-700 hover:text-gray-900 px-3 py-1 rounded hover:bg-gray-100 transition-colors">File</button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-white border border-gray-200 shadow-lg z-50">
              <DropdownMenuItem onClick={() => handleFileAction('new')}>
                <FileText className="w-4 h-4 mr-2" />
                New
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/')}>
                <Folder className="w-4 h-4 mr-2" />
                Back to Drive
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleFileAction('save')}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFileAction('print')}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Other menus same as GoogleSheets */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-gray-700 hover:text-gray-900 px-3 py-1 rounded hover:bg-gray-100 transition-colors">Edit</button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-white border border-gray-200 shadow-lg z-50">
              <DropdownMenuItem onClick={() => handleEditAction('undo')}>
                <Undo className="w-4 h-4 mr-2" />
                Undo
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEditAction('redo')}>
                <Redo className="w-4 h-4 mr-2" />
                Redo
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleEditAction('cut')}>
                <Scissors className="w-4 h-4 mr-2" />
                Cut
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEditAction('copy')}>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEditAction('paste')}>
                <Clipboard className="w-4 h-4 mr-2" />
                Paste
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleEditAction('find')}>
                <Search className="w-4 h-4 mr-2" />
                Find and replace
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-gray-700 hover:text-gray-900 px-3 py-1 rounded hover:bg-gray-100 transition-colors">View</button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-white border border-gray-200 shadow-lg z-50">
              <DropdownMenuItem onClick={() => handleViewAction('freeze')}>
                Freeze
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleViewAction('gridlines')}>
                Gridlines
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleViewAction('formulas')}>
                Show formulas
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleZoomIn}>
                <ZoomIn className="w-4 h-4 mr-2" />
                Zoom in
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleZoomOut}>
                <ZoomOut className="w-4 h-4 mr-2" />
                Zoom out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-gray-700 hover:text-gray-900 px-3 py-1 rounded hover:bg-gray-100 transition-colors">Insert</button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-white border border-gray-200 shadow-lg z-50">
              <DropdownMenuItem onClick={() => handleInsertAction('rows')}>
                Rows above
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleInsertAction('rows')}>
                Rows below
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleInsertAction('columns')}>
                Columns left
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleInsertAction('columns')}>
                Columns right
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleInsertAction('cells')}>
                Cells
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleInsertAction('chart')}>
                Chart
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-gray-700 hover:text-gray-900 px-3 py-1 rounded hover:bg-gray-100 transition-colors">Format</button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-white border border-gray-200 shadow-lg z-50">
              <DropdownMenuItem onClick={() => handleFormatAction('bold')}>
                <Bold className="w-4 h-4 mr-2" />
                Bold
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFormatAction('italic')}>
                <Italic className="w-4 h-4 mr-2" />
                Italic
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFormatAction('underline')}>
                <Underline className="w-4 h-4 mr-2" />
                Underline
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleFormatCurrency}>
                <DollarSign className="w-4 h-4 mr-2" />
                Number format
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFormatAction('borders')}>
                <Grid3x3 className="w-4 h-4 mr-2" />
                Borders
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-gray-700 hover:text-gray-900 px-3 py-1 rounded hover:bg-gray-100 transition-colors">Data</button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-white border border-gray-200 shadow-lg z-50">
              <DropdownMenuItem onClick={() => handleDataAction('sort')}>
                <SortAsc className="w-4 h-4 mr-2" />
                Sort range
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDataAction('filter')}>
                <Filter className="w-4 h-4 mr-2" />
                Create a filter
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleDataAction('pivot')}>
                <Database className="w-4 h-4 mr-2" />
                Pivot table
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-gray-700 hover:text-gray-900 px-3 py-1 rounded hover:bg-gray-100 transition-colors">Tools</button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-white border border-gray-200 shadow-lg z-50">
              <DropdownMenuItem onClick={() => handleToolsAction('spelling')}>
                Spelling and grammar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleToolsAction('script')}>
                <Calculator className="w-4 h-4 mr-2" />
                Script editor
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-gray-700 hover:text-gray-900 px-3 py-1 rounded hover:bg-gray-100 transition-colors">Extensions</button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-white border border-gray-200 shadow-lg z-50">
              <DropdownMenuItem onClick={() => toast.success("Add-ons menu")}>
                Add-ons
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.success("Apps Script")}>
                Apps Script
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-gray-700 hover:text-gray-900 px-3 py-1 rounded hover:bg-gray-100 transition-colors">Help</button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-white border border-gray-200 shadow-lg z-50">
              <DropdownMenuItem onClick={() => window.open('https://support.google.com/docs/topic/1382883', '_blank')}>
                <HelpCircle className="w-4 h-4 mr-2" />
                Sheets Help
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.success("Training materials opened")}>
                Training
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.success("Updates and news")}>
                Updates
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => toast.success("Keyboard shortcuts shown")}>
                Keyboard shortcuts
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Toolbar - Same as GoogleSheets */}
      <div className="border-b border-gray-200 bg-white px-6 py-2">
        <div className="flex items-center gap-1 bg-gray-100 rounded-full px-4 py-2 w-fit">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            title="Undo"
            className="hover:bg-gray-200"
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            title="Redo"
            className="hover:bg-gray-200"
          >
            <Redo className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handlePrint} title="Print" className="hover:bg-gray-200">
            <Printer className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => toast.success("Paint format")} title="Paint format" className="hover:bg-gray-200">
            <Palette className="w-4 h-4" />
          </Button>
          
          <div className="w-px h-6 bg-gray-300 mx-2"></div>
          
          
          <Button variant="ghost" size="sm" className="text-xs px-2 hover:bg-gray-200" title="Zoom">
            {zoom}%
          </Button>
          <Button variant="ghost" size="sm" onClick={handleZoomOut} title="Zoom out" className="hover:bg-gray-200">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleZoomIn} title="Zoom in" className="hover:bg-gray-200">
            <ZoomIn className="w-4 h-4" />
          </Button>
          
          <div className="w-px h-6 bg-gray-300 mx-2"></div>
          
          <Button variant="ghost" size="sm" onClick={handleFormatCurrency} title="Format as currency" className="hover:bg-gray-200">
            <DollarSign className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleFormatPercent} title="Format as percent" className="hover:bg-gray-200">
            <Percent className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => toast.success("More number formats")} title="More number formats" className="hover:bg-gray-200">
            <Hash className="w-4 h-4" />
          </Button>
          
          <div className="w-px h-6 bg-gray-300 mx-2"></div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => toggleCellFormat('bold')}
            className={cn("hover:bg-gray-200", currentFormat.bold && 'bg-gray-300')}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => toggleCellFormat('italic')}
            className={cn("hover:bg-gray-200", currentFormat.italic && 'bg-gray-300')}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => toggleCellFormat('underline')}
            className={cn("hover:bg-gray-200", currentFormat.underline && 'bg-gray-300')}
            title="Underline"
          >
            <Underline className="w-4 h-4" />
          </Button>
          
          <div className="w-px h-6 bg-gray-300 mx-2"></div>
          
          
          <Popover open={textColorOpen} onOpenChange={setTextColorOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" title="Text color" className="hover:bg-gray-200">
                <div className="flex flex-col items-center">
                  <div className="text-lg">A</div>
                  <div 
                    className="w-4 h-1 rounded-sm" 
                    style={{ backgroundColor: currentFormat.textColor || '#000000' }}
                  ></div>
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <ColorPicker 
                onColorSelect={(color) => handleColorSelect(color, 'textColor')} 
                type="text"
              />
            </PopoverContent>
          </Popover>
          
          <Popover open={fillColorOpen} onOpenChange={setFillColorOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" title="Fill color" className="hover:bg-gray-200">
                <div className="flex flex-col items-center">
                  <div className="w-4 h-3 border border-gray-400 rounded-sm relative overflow-hidden">
                    <div 
                      className="absolute inset-0" 
                      style={{ backgroundColor: currentFormat.backgroundColor || 'transparent' }}
                    ></div>
                  </div>
                  <div 
                    className="w-4 h-1 rounded-sm mt-0.5" 
                    style={{ backgroundColor: currentFormat.backgroundColor || '#ffff00' }}
                  ></div>
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <ColorPicker 
                onColorSelect={(color) => handleColorSelect(color, 'backgroundColor')} 
                type="fill"
              />
            </PopoverContent>
          </Popover>
          
          <div className="w-px h-6 bg-gray-300 mx-2"></div>
          
          <Button variant="ghost" size="sm" onClick={() => toast.success("Borders applied")} title="Borders" className="hover:bg-gray-200">
            <Grid3x3 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => toast.success("Merge cells")} title="Merge cells" className="hover:bg-gray-200">
            <Merge className="w-4 h-4" />
          </Button>
          
          <div className="w-px h-6 bg-gray-300 mx-2"></div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => toggleCellFormat('textAlign', 'left')}
            className={cn("hover:bg-gray-200", currentFormat.textAlign === 'left' && 'bg-gray-300')}
            title="Align left"
          >
            <AlignLeft className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => toggleCellFormat('textAlign', 'center')}
            className={cn("hover:bg-gray-200", currentFormat.textAlign === 'center' && 'bg-gray-300')}
            title="Align center"
          >
            <AlignCenter className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => toggleCellFormat('textAlign', 'right')}
            className={cn("hover:bg-gray-200", currentFormat.textAlign === 'right' && 'bg-gray-300')}
            title="Align right"
          >
            <AlignRight className="w-4 h-4" />
          </Button>
          
          <div className="w-px h-6 bg-gray-300 mx-2"></div>
          
          <Button variant="ghost" size="sm" onClick={() => toast.success("More options")} title="More options" className="hover:bg-gray-200">
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

export default SpreadsheetEditor;
