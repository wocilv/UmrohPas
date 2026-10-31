import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Filters, Package, defaultFilters } from './types';
import { allPackages } from './data/packages';
import { airports, airlines, directFlightAirlines, makkahHotels, madinahHotels, travelBrands } from './data/constants';
import { travelAgencies } from './data/travelAgencies';
import { Search, Calendar, Clock, Plane, Building2, MapPin, ChevronDown, Star, Phone, Filter, X, SlidersHorizontal, ArrowUpDown, Check, Heart, Share2, ChevronLeft, ChevronRight } from 'lucide-react';

type Page = 'landing' | 'results';
type SortOption = 'price-asc' | 'price-desc' | 'rating' | 'days';

// ============ TAG/CHIP DISPLAY ============
function TagChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-md text-xs font-medium text-emerald-700">
      <span>{label}</span>
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 hover:bg-emerald-200 rounded-full p-0.5 transition-colors"
        aria-label={`Hapus ${label}`}
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

// ============ SEARCHABLE MULTI-SELECT DROPDOWN ============
function SearchableMultiSelect({ options, selected, onChange, placeholder, label, disabledValues = [] }: {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (val: string[]) => void;
  placeholder: string;
  label: string;
  disabledValues?: string[];
}) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (val: string) => {
    if (disabledValues.includes(val)) return;
    if (selected.includes(val)) {
      onChange(selected.filter(s => s !== val));
    } else {
      onChange([...selected, val]);
    }
  };

  const removeTag = (val: string) => {
    onChange(selected.filter(s => s !== val));
  };

  const getLabel = (val: string) => {
    const opt = options.find(o => o.value === val);
    return opt ? opt.label : val;
  };

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeSelected = selected.filter(val => !disabledValues.includes(val));
  const eliminatedSelected = selected.filter(val => disabledValues.includes(val));

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-left bg-white hover:border-emerald-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none flex items-center justify-between"
      >
        <span className="truncate text-gray-700">
          {selected.length === 0 ? placeholder : `${selected.length} dipilih`}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-gray-100">
            <input
              type="text"
              placeholder={`Cari ${label.toLowerCase()}...`}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              autoFocus
            />
          </div>
          <div className="overflow-y-auto flex-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-sm text-gray-500 text-center">
                Tidak ditemukan
              </div>
            ) : (
              filteredOptions.map(opt => {
                const isDisabled = disabledValues.includes(opt.value);
                const isSelected = selected.includes(opt.value);
                return (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-2 px-3 py-2 text-sm border-b border-gray-50 last:border-b-0 ${
                      isDisabled 
                        ? 'bg-gray-100 cursor-not-allowed opacity-60' 
                        : 'hover:bg-emerald-50 cursor-pointer'
                    }`}
                  >
                    {!isDisabled && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggle(opt.value)}
                        className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                      />
                    )}
                    <span className={isDisabled ? 'text-gray-400' : 'text-gray-700'}>
                      {opt.label}
                    </span>
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {activeSelected.map(val => (
            <TagChip key={val} label={getLabel(val)} onRemove={() => removeTag(val)} />
          ))}
          {eliminatedSelected.map(val => (
            <div 
              key={val} 
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-200 border border-gray-300 rounded-md text-xs font-medium text-gray-500 line-through"
              title="Hotel ini tidak termasuk dalam hasil pencarian karena filter saat ini"
            >
              <span>{getLabel(val)}</span>
              <button
                type="button"
                onClick={() => removeTag(val)}
                className="ml-0.5 hover:bg-gray-300 rounded-full p-0.5 transition-colors"
                aria-label={`Hapus ${getLabel(val)}`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ MULTI-SELECT DROPDOWN (Simple, no search) ============
function MultiSelect({ options, selected, onChange, placeholder, label }: {
  options: { 
    value: string; 
    label: string; 
    highlight?: boolean;
    tags?: Array<{ text: string; color: 'gold' | 'navy' | 'emerald' }>;
  }[];
  selected: string[];
  onChange: (val: string[]) => void;
  placeholder: string;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (val: string) => {
    if (selected.includes(val)) {
      onChange(selected.filter(s => s !== val));
    } else {
      onChange([...selected, val]);
    }
  };

  const removeTag = (val: string) => {
    onChange(selected.filter(s => s !== val));
  };

  const getLabel = (val: string) => {
    const opt = options.find(o => o.value === val);
    return opt ? opt.label : val;
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-left bg-white hover:border-emerald-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none flex items-center justify-between"
      >
        <span className="truncate text-gray-700">
          {selected.length === 0 ? placeholder : `${selected.length} dipilih`}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options.map(opt => {
            const isHighlighted = opt.highlight === true;
            return (
              <label
                key={opt.value}
                className={`flex items-center gap-2 px-3 py-2 cursor-pointer ${
                  isHighlighted 
                    ? 'bg-emerald-50 hover:bg-emerald-100 border-l-4 border-emerald-500' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(opt.value)}
                  onChange={() => toggle(opt.value)}
                  className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                />
                <span className={`${isHighlighted ? 'text-sm font-semibold text-emerald-700' : 'text-xs text-gray-600'}`}>
                  {opt.label}
                </span>
                {opt.tags && opt.tags.length > 0 && (
                  <div className="ml-auto flex gap-1">
                    {opt.tags.map((tag, idx) => {
                      const colorClasses = {
                        gold: 'bg-amber-100 text-amber-800 border-amber-300',
                        navy: 'bg-blue-100 text-blue-900 border-blue-300',
                        emerald: 'bg-emerald-500 text-white border-emerald-600'
                      };
                      return (
                        <span 
                          key={idx}
                          className={`text-[10px] px-1.5 py-0.5 rounded-full border ${colorClasses[tag.color]}`}
                        >
                          {tag.text}
                        </span>
                      );
                    })}
                  </div>
                )}
              </label>
            );
          })}
        </div>
      )}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selected.map(val => (
            <TagChip key={val} label={getLabel(val)} onRemove={() => removeTag(val)} />
          ))}
        </div>
      )}
    </div>
  );
}

// ============ RANGE SLIDER (DOUBLE HANDLE) ============
function RangeSlider({ min, max, valueMin, valueMax, onChange, suffix }: {
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  onChange: (min: number, max: number) => void;
  suffix: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<'min' | 'max' | null>(null);

  const getPercent = (val: number) => ((val - min) / (max - min)) * 100;

  const handleMove = useCallback((clientX: number) => {
    if (!trackRef.current || !dragging) return;
    const rect = trackRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const value = Math.round((min + percent * (max - min)) / 50) * 50;
    
    if (dragging === 'min') {
      onChange(Math.min(value, valueMax - 50), valueMax);
    } else {
      onChange(valueMin, Math.max(value, valueMin + 50));
    }
  }, [dragging, min, max, valueMin, valueMax, onChange]);

  useEffect(() => {
    if (!dragging) return;
    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const handleTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);
    const handleUp = () => setDragging(null);
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleUp);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleUp);
    };
  }, [dragging, handleMove]);

  const minPercent = getPercent(valueMin);
  const maxPercent = getPercent(valueMax);

  return (
    <div className="pt-2">
      <div className="flex justify-between text-xs font-semibold text-emerald-600 mb-3 bg-emerald-50 px-3 py-1.5 rounded-lg">
        <span>{valueMin}{suffix}</span>
        <span>s/d</span>
        <span>{valueMax}{suffix}</span>
      </div>
      <div ref={trackRef} className="relative h-2 bg-gray-200 rounded-full cursor-pointer select-none"
        onMouseDown={(e) => {
          const rect = trackRef.current!.getBoundingClientRect();
          const percent = (e.clientX - rect.left) / rect.width;
          const value = Math.round((min + percent * (max - min)) / 50) * 50;
          if (Math.abs(value - valueMin) < Math.abs(value - valueMax)) {
            setDragging('min');
          } else {
            setDragging('max');
          }
        }}
        onTouchStart={(e) => {
          const rect = trackRef.current!.getBoundingClientRect();
          const percent = (e.touches[0].clientX - rect.left) / rect.width;
          const value = Math.round((min + percent * (max - min)) / 50) * 50;
          if (Math.abs(value - valueMin) < Math.abs(value - valueMax)) {
            setDragging('min');
          } else {
            setDragging('max');
          }
        }}
      >
        <div
          className="absolute h-full bg-emerald-500 rounded-full"
          style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }}
        />
        <div
          className="absolute w-5 h-5 bg-white border-2 border-emerald-600 rounded-full -top-1.5 shadow-md cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
          style={{ left: `${minPercent}%`, transform: 'translateX(-50%)' }}
          onMouseDown={(e) => { e.stopPropagation(); setDragging('min'); }}
          onTouchStart={(e) => { e.stopPropagation(); setDragging('min'); }}
        />
        <div
          className="absolute w-5 h-5 bg-white border-2 border-emerald-600 rounded-full -top-1.5 shadow-md cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
          style={{ left: `${maxPercent}%`, transform: 'translateX(-50%)' }}
          onMouseDown={(e) => { e.stopPropagation(); setDragging('max'); }}
          onTouchStart={(e) => { e.stopPropagation(); setDragging('max'); }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-2">
        <span>{min}{suffix}</span>
        <span>{max}{suffix}</span>
      </div>
    </div>
  );
}

// ============ TRAVEL INFO POPUP ============
function TravelInfoPopup({ brandName, onClose }: { brandName: string; onClose: () => void }) {
  const agency = travelAgencies.find(a => a.brandName === brandName);
  
  if (!agency) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-6 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold">{agency.brandName}</h3>
              <p className="text-emerald-100 text-sm mt-1">{agency.legalName}</p>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-50 p-3 rounded-lg">
              <p className="text-xs text-emerald-600 font-medium">No. PP</p>
              <p className="text-sm font-bold text-gray-900">{agency.ppNumber}/{agency.ppYear}</p>
            </div>
            {agency.pihkNumber && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-blue-600 font-medium">No. PIHK</p>
                <p className="text-sm font-bold text-gray-900">{agency.pihkNumber}/{agency.pihkYear}</p>
              </div>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Direktur Utama</p>
            <p className="text-sm text-gray-900">{agency.ceo}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Kantor Pusat</p>
            <p className="text-sm text-gray-700">{agency.hqAddress}</p>
          </div>
          {agency.branches.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Cabang ({agency.branches.length})</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {agency.branches.map((branch, idx) => (
                  <div key={idx} className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-sm font-medium text-gray-900">{branch.city}</p>
                    <p className="text-xs text-gray-600">{branch.address}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============ DATE RANGE PICKER ============
function DateRangePicker({ startDate, endDate, onStartDateChange, onEndDateChange, travelDays }: {
  startDate: string;
  endDate: string;
  onStartDateChange: (d: string) => void;
  onEndDateChange: (d: string) => void;
  travelDays: string[];
}) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectingStart, setSelectingStart] = useState(true);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (clickedDate < today) return;

    const dateStr = formatDate(clickedDate);

    if (selectingStart) {
      onStartDateChange(dateStr);
      onEndDateChange('');
      setSelectingStart(false);
    } else {
      if (startDate && dateStr < startDate) {
        onStartDateChange(dateStr);
        onEndDateChange(startDate);
      } else {
        onEndDateChange(dateStr);
      }
      setSelectingStart(true);
    }
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const isDateSelected = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateStr = formatDate(date);
    return dateStr === startDate || dateStr === endDate;
  };

  const isDateInRange = (day: number) => {
    if (!startDate || !endDate) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateStr = formatDate(date);
    return dateStr > startDate && dateStr < endDate;
  };

  const isToday = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return formatDate(date) === formatDate(today);
  };

  const isPast = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return date < today;
  };

  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-white">
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
        <span className="text-sm font-semibold text-gray-800">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </span>
        <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
          <div key={`empty-${idx}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, idx) => {
          const day = idx + 1;
          const past = isPast(day);
          const selected = isDateSelected(day);
          const inRange = isDateInRange(day);
          const todayDate = isToday(day);

          return (
            <button
              key={day}
              onClick={() => !past && handleDateClick(day)}
              disabled={past}
              className={`
                aspect-square flex items-center justify-center text-xs rounded-lg transition
                ${past ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-emerald-100 cursor-pointer'}
                ${selected ? 'bg-emerald-600 text-white font-bold hover:bg-emerald-700' : ''}
                ${inRange ? 'bg-emerald-100 text-emerald-800' : ''}
                ${todayDate && !selected ? 'ring-2 ring-emerald-400' : ''}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>

      {(startDate || endDate) && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs">
            <div className="flex-1 bg-emerald-50 px-2 py-1.5 rounded-lg">
              <p className="text-emerald-600 font-medium">Berangkat</p>
              <p className="text-gray-900 font-semibold">{startDate ? new Date(startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</p>
            </div>
            <span className="text-gray-400">→</span>
            <div className="flex-1 bg-emerald-50 px-2 py-1.5 rounded-lg">
              <p className="text-emerald-600 font-medium">Pulang</p>
              <p className="text-gray-900 font-semibold">{endDate ? new Date(endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ TRAVEL SELECT ============
function TravelSelect({ selected, onChange }: {
  selected: string[];
  onChange: (val: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (val: string) => {
    if (selected.includes(val)) {
      onChange(selected.filter(s => s !== val));
    } else {
      onChange([...selected, val]);
    }
  };

  const filteredBrands = travelBrands.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-left bg-white hover:border-emerald-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none flex items-center justify-between"
      >
        <span className="truncate text-gray-700">
          {selected.length === 0 ? 'Pilih travel' : `${selected.length} travel dipilih`}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-gray-100">
            <input
              type="text"
              placeholder="Cari travel..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              autoFocus
            />
          </div>
          <div className="overflow-y-auto flex-1">
            {filteredBrands.map(brand => (
              <label
                key={brand.name}
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-emerald-50 cursor-pointer border-b border-gray-50 last:border-b-0"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(brand.name)}
                  onChange={() => toggle(brand.name)}
                  className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                />
                <div className="flex-1">
                  <p className="text-gray-700 font-medium">{brand.name}</p>
                  <p className="text-xs text-gray-500">{brand.contact} • {brand.phone}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selected.map(val => (
            <TagChip key={val} label={val} onRemove={() => onChange(selected.filter(s => s !== val))} />
          ))}
        </div>
      )}
    </div>
  );
}

// ============ FILTER SECTION WRAPPER ============
function FilterSection({ icon, label, children }: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="border-b border-gray-100 pb-4 last:border-b-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between mb-3 hover:bg-gray-50 -mx-2 px-2 py-1 rounded-lg transition"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-semibold text-gray-800">{label}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>
      {expanded && children}
    </div>
  );
}

// ============ HIERARCHICAL FLIGHT TYPE SELECTOR (with Maskapai) ============
function FlightTypeSelector({ flightTypes, onChange, directAircrafts, transitAircrafts, onDirectAircraftsChange, onTransitAircraftsChange }: {
  flightTypes: Filters['flightTypes'];
  onChange: (ft: Filters['flightTypes']) => void;
  directAircrafts: string[];
  transitAircrafts: string[];
  onDirectAircraftsChange: (val: string[]) => void;
  onTransitAircraftsChange: (val: string[]) => void;
}) {
  const [transitExpanded, setTransitExpanded] = useState(false);
  const [domesticExpanded, setDomesticExpanded] = useState(false);
  const [internationalExpanded, setInternationalExpanded] = useState(false);
  const [directAirlineExpanded, setDirectAirlineExpanded] = useState(false);
  const [transitAirlineExpanded, setTransitAirlineExpanded] = useState(false);

  const toggle = (key: keyof Filters['flightTypes']) => {
    const newFt = { ...flightTypes };
    newFt[key] = !newFt[key];
    onChange(newFt);
  };

  const transitDisabled = !flightTypes.transit;
  const domesticDisabled = transitDisabled || !flightTypes.transitDomestic;
  const internationalDisabled = transitDisabled || !flightTypes.transitInternational;

  const directAirlineOptions = airlines
    .filter(al => directFlightAirlines.includes(al.name))
    .map(al => ({ value: al.name, label: `${al.name} - ${al.iata}` }));

  const transitAirlineOptions = airlines.map(al => ({ value: al.name, label: `${al.name} - ${al.iata}` }));

  const toggleDirectAirline = (val: string) => {
    if (directAircrafts.includes(val)) {
      onDirectAircraftsChange(directAircrafts.filter(s => s !== val));
    } else {
      onDirectAircraftsChange([...directAircrafts, val]);
    }
  };

  const toggleTransitAirline = (val: string) => {
    if (transitAircrafts.includes(val)) {
      onTransitAircraftsChange(transitAircrafts.filter(s => s !== val));
    } else {
      onTransitAircraftsChange([...transitAircrafts, val]);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-white">
      <div className="p-3 border-b border-gray-100">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={flightTypes.direct}
            onChange={() => toggle('direct')}
            className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
          />
          <span className="text-sm font-medium text-gray-700">Langsung</span>
        </label>

        {flightTypes.direct && (
          <div className="mt-2 ml-6">
            <button
              type="button"
              onClick={() => setDirectAirlineExpanded(!directAirlineExpanded)}
              className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:text-emerald-800 transition"
            >
              <ChevronDown className={`w-3 h-3 transition-transform ${directAirlineExpanded ? 'rotate-0' : '-rotate-90'}`} />
              Pilih Maskapai ({directAircrafts.length}/{directAirlineOptions.length})
            </button>
            {directAirlineExpanded && (
              <div className="mt-1.5 space-y-1 pl-2 border-l-2 border-emerald-100">
                {directAirlineOptions.map(opt => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer py-0.5">
                    <input
                      type="checkbox"
                      checked={directAircrafts.includes(opt.value)}
                      onChange={() => toggleDirectAirline(opt.value)}
                      className="w-3.5 h-3.5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                    />
                    <span className="text-xs text-gray-600">{opt.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={flightTypes.transit}
            onChange={() => {
              toggle('transit');
              if (!flightTypes.transit) {
                setTransitExpanded(true);
              }
            }}
            className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
          />
          <span className="text-sm font-medium text-gray-700">Transit</span>
        </label>

        {flightTypes.transit && transitExpanded && (
          <div className="mt-2 ml-6 space-y-2 bg-gray-50 rounded-lg p-2.5">
            <div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDomesticExpanded(!domesticExpanded)}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                >
                  <ChevronDown className={`w-3 h-3 transition-transform ${domesticExpanded ? 'rotate-0' : '-rotate-90'}`} />
                </button>
                <label className="flex items-center gap-2 cursor-pointer flex-1">
                  <input
                    type="checkbox"
                    checked={flightTypes.transitDomestic}
                    onChange={() => toggle('transitDomestic')}
                    className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">Transit Domestik</span>
                </label>
              </div>
              
              {flightTypes.transitDomestic && domesticExpanded && (
                <div className="ml-6 mt-2 space-y-1.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={flightTypes.transitDomesticOvernight}
                      onChange={() => toggle('transitDomesticOvernight')}
                      className="w-3.5 h-3.5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                    />
                    <span className="text-xs text-gray-600">Menginap</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={flightTypes.transitDomesticNoOvernight}
                      onChange={() => toggle('transitDomesticNoOvernight')}
                      className="w-3.5 h-3.5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                    />
                    <span className="text-xs text-gray-600">Tidak Menginap</span>
                  </label>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setInternationalExpanded(!internationalExpanded)}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                >
                  <ChevronDown className={`w-3 h-3 transition-transform ${internationalExpanded ? 'rotate-0' : '-rotate-90'}`} />
                </button>
                <label className="flex items-center gap-2 cursor-pointer flex-1">
                  <input
                    type="checkbox"
                    checked={flightTypes.transitInternational}
                    onChange={() => toggle('transitInternational')}
                    className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">Transit Internasional</span>
                </label>
              </div>
              
              {flightTypes.transitInternational && internationalExpanded && (
                <div className="ml-6 mt-2 space-y-1.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={flightTypes.transitInternationalCityTour}
                      onChange={() => toggle('transitInternationalCityTour')}
                      className="w-3.5 h-3.5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                    />
                    <span className="text-xs text-gray-600">Ada City Tour</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={flightTypes.transitInternationalNoCityTour}
                      onChange={() => toggle('transitInternationalNoCityTour')}
                      className="w-3.5 h-3.5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                    />
                    <span className="text-xs text-gray-600">Tanpa City Tour</span>
                  </label>
                </div>
              )}
            </div>
          </div>
        )}

        {flightTypes.transit && !transitExpanded && (
          <button
            onClick={() => setTransitExpanded(true)}
            className="ml-6 mt-1 text-xs text-emerald-600 hover:bg-emerald-50 transition flex items-center gap-1 px-2 py-1 rounded"
          >
            <ChevronDown className="w-3 h-3" />
            Lihat opsi transit
          </button>
        )}

        {flightTypes.transit && (
          <div className="mt-2 ml-6">
            <button
              type="button"
              onClick={() => setTransitAirlineExpanded(!transitAirlineExpanded)}
              className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:text-emerald-800 transition"
            >
              <ChevronDown className={`w-3 h-3 transition-transform ${transitAirlineExpanded ? 'rotate-0' : '-rotate-90'}`} />
              Pilih Maskapai ({transitAircrafts.length}/{transitAirlineOptions.length})
            </button>
            {transitAirlineExpanded && (
              <div className="mt-1.5 space-y-1 pl-2 border-l-2 border-emerald-100 max-h-48 overflow-y-auto">
                {transitAirlineOptions.map(opt => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer py-0.5">
                    <input
                      type="checkbox"
                      checked={transitAircrafts.includes(opt.value)}
                      onChange={() => toggleTransitAirline(opt.value)}
                      className="w-3.5 h-3.5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                    />
                    <span className="text-xs text-gray-600">{opt.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============ FILTER PACKAGES FUNCTION ============
function filterPackages(filters: Filters, packages: Package[]): Package[] {
  return packages.filter(pkg => {
    if (filters.departureDateStart && filters.departureDateEnd) {
      if (pkg.departureDate < filters.departureDateStart || pkg.departureDate > filters.departureDateEnd) return false;
    }

    if (filters.travelDays.length > 0) {
      const d = pkg.travelDays;
      const match = filters.travelDays.some(range => {
        switch (range) {
          case '3-8': return d >= 3 && d <= 8;
          case '9-11': return d >= 9 && d <= 11;
          case '12-14': return d >= 12 && d <= 14;
          case '15-16': return d >= 15 && d <= 16;
          case '17-30': return d >= 17 && d <= 30;
          case '31-45': return d >= 31 && d <= 45;
          default: return false;
        }
      });
      if (!match) return false;
    }

    const ft = filters.flightTypes;
    const anySelected = ft.direct || ft.transitDomesticOvernight || ft.transitDomesticNoOvernight ||
      ft.transitInternationalCityTour || ft.transitInternationalNoCityTour;
    
    if (anySelected) {
      let match = false;
      if (pkg.transitType === 'direct' && ft.direct) match = true;
      if (pkg.transitType === 'transit_domestic_overnight' && ft.transit && ft.transitDomestic && ft.transitDomesticOvernight) match = true;
      if (pkg.transitType === 'transit_domestic_no_overnight' && ft.transit && ft.transitDomestic && ft.transitDomesticNoOvernight) match = true;
      if (pkg.transitType === 'transit_international_city_tour' && ft.transit && ft.transitInternational && ft.transitInternationalCityTour) match = true;
      if (pkg.transitType === 'transit_international_no_city_tour' && ft.transit && ft.transitInternational && ft.transitInternationalNoCityTour) match = true;
      if (!match) return false;
    }

    if (filters.airports.length > 0) {
      if (!filters.airports.includes(pkg.airportCode)) return false;
    }

    if (filters.saudiRoutes.length > 0) {
      if (!filters.saudiRoutes.includes(pkg.saudiRoute)) return false;
    }

    if (pkg.transitType === 'direct') {
      if (filters.directAircrafts.length > 0 && filters.directAircrafts.length < directFlightAirlines.length) {
        if (!filters.directAircrafts.includes(pkg.aircraft)) return false;
      }
    } else {
      if (filters.transitAircrafts.length > 0 && filters.transitAircrafts.length < airlines.length) {
        if (!filters.transitAircrafts.includes(pkg.aircraft)) return false;
      }
    }

    if (filters.travelBrands.length > 0) {
      if (!filters.travelBrands.includes(pkg.travelBrand)) return false;
    }

    if (filters.makkahHotel.mode === 'name' && filters.makkahHotel.names.length > 0) {
      if (!filters.makkahHotel.names.includes(pkg.makkahHotel.name)) return false;
      
      const starMatch = filters.makkahHotel.stars.length === 0 || filters.makkahHotel.stars.includes(pkg.makkahHotel.stars);
      const distanceMatch = (filters.makkahHotel.distanceMin === 0 && filters.makkahHotel.distanceMax === 2000) || 
                           (pkg.makkahHotel.distance >= filters.makkahHotel.distanceMin && pkg.makkahHotel.distance <= filters.makkahHotel.distanceMax);
      
      if (!(starMatch && distanceMatch)) return false;
    } else if (filters.makkahHotel.mode === 'stars' && filters.makkahHotel.stars.length > 0) {
      if (!filters.makkahHotel.stars.includes(pkg.makkahHotel.stars)) return false;
    } else if (filters.makkahHotel.mode === 'distance') {
      if (pkg.makkahHotel.distance < filters.makkahHotel.distanceMin || pkg.makkahHotel.distance > filters.makkahHotel.distanceMax) return false;
    }

    if (filters.madinahHotel.mode === 'name' && filters.madinahHotel.names.length > 0) {
      if (!filters.madinahHotel.names.includes(pkg.madinahHotel.name)) return false;
      
      const starMatch = filters.madinahHotel.stars.length === 0 || filters.madinahHotel.stars.includes(pkg.madinahHotel.stars);
      const distanceMatch = (filters.madinahHotel.distanceMin === 0 && filters.madinahHotel.distanceMax === 2000) || 
                           (pkg.madinahHotel.distance >= filters.madinahHotel.distanceMin && pkg.madinahHotel.distance <= filters.madinahHotel.distanceMax);
      
      if (!(starMatch && distanceMatch)) return false;
    } else if (filters.madinahHotel.mode === 'stars' && filters.madinahHotel.stars.length > 0) {
      if (!filters.madinahHotel.stars.includes(pkg.madinahHotel.stars)) return false;
    } else if (filters.madinahHotel.mode === 'distance') {
      if (pkg.madinahHotel.distance < filters.madinahHotel.distanceMin || pkg.madinahHotel.distance > filters.madinahHotel.distanceMax) return false;
    }

    return true;
  });
}

// ============ MAIN APP ============
function App() {
  const [page, setPage] = useState<Page>('landing');
  const [filters, setFilters] = useState<Filters>({
    ...defaultFilters,
    directAircrafts: directFlightAirlines,
    transitAircrafts: airlines.map(al => al.name),
  });
  const [sortBy, setSortBy] = useState<SortOption>('price-asc');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const handleSearch = () => {
    if (!filters.departureDateStart || !filters.departureDateEnd) {
      alert('Silakan pilih rentang tanggal keberangkatan');
      return;
    }
    setPage('results');
    setShowMobileFilters(false);
  };

  const results = useMemo(() => {
    const filtered = filterPackages(filters, allPackages);
    switch (sortBy) {
      case 'price-asc': return [...filtered].sort((a, b) => a.price - b.price);
      case 'price-desc': return [...filtered].sort((a, b) => b.price - a.price);
      case 'rating': return [...filtered].sort((a, b) => b.rating - a.rating);
      case 'days': return [...filtered].sort((a, b) => a.travelDays - b.travelDays);
      default: return filtered;
    }
  }, [filters, sortBy]);

  if (page === 'landing') {
    return <LandingPage filters={filters} setFilters={setFilters} onSearch={handleSearch} />;
  }

  return (
    <ResultsPage
      filters={filters}
      setFilters={setFilters}
      results={results}
      totalResults={results.length}
      sortBy={sortBy}
      setSortBy={setSortBy}
      onBack={() => setPage('landing')}
      showMobileFilters={showMobileFilters}
      setShowMobileFilters={setShowMobileFilters}
    />
  );
}

// ============ LANDING PAGE ============
function LandingPage({ filters, setFilters, onSearch }: {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  onSearch: () => void;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-emerald-100 px-4 py-2 rounded-full mb-4">
            <Plane className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-700">UmrohKu</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Cari Paket Umroh<br />
            <span className="text-emerald-600">Terbaik & Terpercaya</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Temukan paket umroh sesuai kebutuhan Anda dari ratusan travel terpercaya di seluruh Indonesia
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 space-y-6">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">📅 Tanggal Keberangkatan</label>
            <DateRangePicker
              startDate={filters.departureDateStart}
              endDate={filters.departureDateEnd}
              onStartDateChange={d => setFilters(f => ({ ...f, departureDateStart: d }))}
              onEndDateChange={d => setFilters(f => ({ ...f, departureDateEnd: d }))}
              travelDays={filters.travelDays}
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">⏱️ Durasi Perjalanan</label>
            <MultiSelect
              options={[
                { value: '3-8', label: '3-8 Hari', highlight: true },
                { value: '9-11', label: '9-11 Hari', highlight: true },
                { value: '12-14', label: '12-14 Hari' },
                { value: '15-16', label: '15-16 Hari' },
                { value: '17-30', label: '17-30 Hari' },
                { value: '31-45', label: '31-45 Hari' },
              ]}
              selected={filters.travelDays}
              onChange={val => setFilters(f => ({ ...f, travelDays: val }))}
              placeholder="Pilih durasi"
              label="Durasi"
            />
          </div>

          <button
            onClick={onSearch}
            className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-4 rounded-xl font-bold text-lg hover:from-emerald-700 hover:to-emerald-800 transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <Search className="w-5 h-5" />
            Cari Paket Umroh
          </button>
        </div>
      </div>
    </div>
  );
}

// ============ RESULTS PAGE ============
function ResultsPage({ filters, setFilters, results, totalResults, sortBy, setSortBy, onBack, showMobileFilters, setShowMobileFilters }: {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  results: Package[];
  totalResults: number;
  sortBy: SortOption;
  setSortBy: (s: SortOption) => void;
  onBack: () => void;
  showMobileFilters: boolean;
  setShowMobileFilters: (v: boolean) => void;
}) {
  const getTransitLabel = (ft: Filters['flightTypes']) => {
    const count = [ft.direct, ft.transitDomesticOvernight, ft.transitDomesticNoOvernight, ft.transitInternationalCityTour, ft.transitInternationalNoCityTour].filter(Boolean).length;
    return count === 5 ? 'Semua' : `${count} tipe`;
  };

  const handleResetFilters = () => {
    setFilters({
      ...defaultFilters,
      directAircrafts: directFlightAirlines,
      transitAircrafts: airlines.map(al => al.name),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <button onClick={onBack} className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium text-sm bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition">
                <ArrowUpDown className="w-3.5 h-3.5 rotate-90" />
                <span className="hidden sm:inline">Ubah Pencarian</span>
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">U</span>
                </div>
                <span className="font-bold text-gray-900 hidden sm:inline">UmrohKu</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500 font-medium">Live</span>
              </div>
              <span className="text-sm text-gray-600">
                <span className="font-bold text-emerald-600 text-lg">{totalResults}</span> paket ditemukan
              </span>
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filter
              </button>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 flex-wrap">
            <QuickFilter label="Durasi" value={filters.travelDays.length > 0 ? `${filters.travelDays.length} pilihan` : '-'} />
            <QuickFilter label="Tanggal" value={filters.departureDateStart ? `${formatDateShort(filters.departureDateStart)} - ${formatDateShort(filters.departureDateEnd)}` : '-'} />
            <QuickFilter label="Penerbangan" value={getTransitLabel(filters.flightTypes)} />
            <QuickFilter label="B. Berangkat" value={filters.airports.length > 0 ? `${filters.airports.length} bandara` : 'Semua'} />
            <QuickFilter label="Rute Saudi" value={filters.saudiRoutes.length > 0 ? `${filters.saudiRoutes.length} rute` : 'Semua'} />
            <QuickFilter label="Maskapai" value={`${filters.directAircrafts.length} langsung / ${filters.transitAircrafts.length} transit`} />
            <QuickFilter label="Travel" value={filters.travelBrands.length > 0 ? `${filters.travelBrands.length} travel` : 'Semua'} />
            <QuickFilter label="Hotel Makkah" value={getHotelLabel(filters.makkahHotel, makkahHotels)} />
            <QuickFilter label="Hotel Madinah" value={getHotelLabel(filters.madinahHotel, madinahHotels)} />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6" style={{ minHeight: 'calc(100vh - 140px)' }}>
          <aside className={`
            ${showMobileFilters ? 'fixed inset-0 z-50 bg-white overflow-y-auto p-4' : 'hidden'}
            lg:block lg:w-80 lg:flex-shrink-0
          `}>
            <div className="lg:sticky lg:top-[140px] lg:max-h-[calc(100vh-160px)] lg:overflow-y-auto">
              <div className="flex items-center justify-between mb-4 lg:hidden">
                <h3 className="font-bold text-gray-900 text-lg">Filter Pencarian</h3>
                <button onClick={() => setShowMobileFilters(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Filter className="w-4 h-4 text-emerald-600" />
                    Filter Pencarian
                  </h3>
                  <button
                    onClick={handleResetFilters}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                    title="Reset semua filter"
                  >
                    Reset
                  </button>
                </div>

                <div className="space-y-4">
                  <FilterSection icon={<Calendar className="w-4 h-4 text-emerald-600" />} label="Tanggal & Durasi">
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1.5 block">📅 Tanggal Keberangkatan</label>
                        <DateRangePicker
                          startDate={filters.departureDateStart}
                          endDate={filters.departureDateEnd}
                          onStartDateChange={d => setFilters(f => ({ ...f, departureDateStart: d }))}
                          onEndDateChange={d => setFilters(f => ({ ...f, departureDateEnd: d }))}
                          travelDays={filters.travelDays}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1.5 block">⏱️ Durasi Perjalanan</label>
                        <MultiSelect
                          options={[
                            { value: '3-8', label: '3-8 Hari', highlight: true },
                            { value: '9-11', label: '9-11 Hari', highlight: true },
                            { value: '12-14', label: '12-14 Hari' },
                            { value: '15-16', label: '15-16 Hari' },
                            { value: '17-30', label: '17-30 Hari' },
                            { value: '31-45', label: '31-45 Hari' },
                          ]}
                          selected={filters.travelDays}
                          onChange={val => setFilters(f => ({ ...f, travelDays: val }))}
                          placeholder="Pilih durasi"
                          label="Durasi"
                        />
                      </div>
                    </div>
                  </FilterSection>

                  <FilterSection icon={<Plane className="w-4 h-4 text-emerald-600" />} label="Tipe Penerbangan & Maskapai">
                    <FlightTypeSelector
                      flightTypes={filters.flightTypes}
                      onChange={ft => setFilters(f => ({ ...f, flightTypes: ft }))}
                      directAircrafts={filters.directAircrafts}
                      transitAircrafts={filters.transitAircrafts}
                      onDirectAircraftsChange={val => setFilters(f => ({ ...f, directAircrafts: val }))}
                      onTransitAircraftsChange={val => setFilters(f => ({ ...f, transitAircrafts: val }))}
                    />
                  </FilterSection>

                  <FilterSection icon={<MapPin className="w-4 h-4 text-emerald-600" />} label="Pilihan Bandara">
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1.5 block">🛫 Bandara Berangkat</label>
                        <SearchableMultiSelect
                          options={airports.map(apt => ({ value: apt.code, label: `${apt.code} - ${apt.name} (${apt.city})` }))}
                          selected={filters.airports}
                          onChange={val => setFilters(f => ({ ...f, airports: val }))}
                          placeholder="Pilih bandara keberangkatan"
                          label="Bandara"
                        />
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1.5 block">🛬 Bandara Saudi - Landing & Pulang</label>
                        <SearchableMultiSelect
                          options={[
                            { value: 'JED - MED (Makkah Dulu)', label: 'JED - MED (Makkah Dulu)' },
                            { value: 'MED - JED (Madinah Dulu)', label: 'MED - JED (Madinah Dulu)' },
                            { value: 'JED - JED (Makkah Dulu)', label: 'JED - JED (Makkah Dulu)' },
                            { value: 'JED - JED (Madinah Dulu)', label: 'JED - JED (Madinah Dulu)' },
                            { value: 'Lainnya', label: 'Lainnya' }
                          ]}
                          selected={filters.saudiRoutes}
                          onChange={val => setFilters(f => ({ ...f, saudiRoutes: val }))}
                          placeholder="Pilih rute Saudi"
                          label="Rute Saudi"
                        />
                      </div>
                    </div>
                  </FilterSection>

                  <FilterSection icon={<Building2 className="w-4 h-4 text-emerald-600" />} label="Nama Travel">
                    <TravelSelect
                      selected={filters.travelBrands}
                      onChange={val => setFilters(f => ({ ...f, travelBrands: val }))}
                    />
                  </FilterSection>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    Penginapan
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <HotelFilter
                      label="🕋 Hotel Makkah"
                      hotel={filters.makkahHotel}
                      hotels={makkahHotels}
                      onChange={val => setFilters(f => ({ ...f, makkahHotel: val }))}
                    />
                    <HotelFilter
                      label="🕌 Hotel Madinah"
                      hotel={filters.madinahHotel}
                      hotels={madinahHotels}
                      onChange={val => setFilters(f => ({ ...f, madinahHotel: val }))}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <div className="flex gap-3 justify-center">
                      <button onClick={handleResetFilters} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                        Reset Filter
                      </button>
                      <button onClick={onBack} className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition">
                        Ubah Pencarian
                      </button>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <main className="flex-1">
            <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Urutkan:</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as SortOption)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                >
                  <option value="price-asc">Harga Terendah</option>
                  <option value="price-desc">Harga Tertinggi</option>
                  <option value="rating">Rating Tertinggi</option>
                  <option value="days">Durasi Terpendek</option>
                </select>
              </div>
              <span className="text-sm text-gray-500">
                Menampilkan <span className="font-bold text-emerald-600">{results.length}</span> dari {totalResults} paket
              </span>
            </div>

            {results.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Tidak ada paket ditemukan</h3>
                <p className="text-gray-600 mb-4">Coba ubah filter pencarian Anda</p>
                <button onClick={handleResetFilters} className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition">
                  Reset Filter
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map(pkg => (
                  <PackageCard key={pkg.id} pkg={pkg} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

// ============ HELPER COMPONENTS ============
function QuickFilter({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
      <span className="text-xs text-emerald-600 font-medium">{label}: </span>
      <span className="text-xs text-emerald-800 font-bold">{value}</span>
    </div>
  );
}

function HotelFilter({ label, hotel, hotels, onChange }: {
  label: string;
  hotel: Filters['makkahHotel'] | Filters['madinahHotel'];
  hotels: typeof makkahHotels;
  onChange: (val: Filters['makkahHotel'] | Filters['madinahHotel']) => void;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-700 mb-1.5 block">{label}</label>
      <div className="flex gap-1 mb-2">
        <button
          onClick={() => onChange({ ...hotel, mode: 'stars' })}
          className={`px-2 py-1 text-xs rounded font-medium ${hotel.mode === 'stars' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'}`}
        >
          Bintang
        </button>
        <button
          onClick={() => onChange({ ...hotel, mode: 'distance' })}
          className={`px-2 py-1 text-xs rounded font-medium ${hotel.mode === 'distance' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'}`}
        >
          Jarak
        </button>
        <button
          onClick={() => onChange({ ...hotel, mode: 'name' })}
          className={`px-2 py-1 text-xs rounded font-medium ${hotel.mode === 'name' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'}`}
        >
          Nama
        </button>
      </div>

      {hotel.mode === 'stars' && (
        <MultiSelect
          options={[
            { value: '5', label: '⭐⭐⭐⭐⭐ Bintang 5' },
            { value: '4', label: '⭐⭐⭐⭐ Bintang 4' },
            { value: '3', label: '⭐⭐⭐ Bintang 3' },
            { value: '2', label: '⭐⭐ Bintang 2' },
            { value: '1', label: '⭐ Bintang 1' },
            { value: 'Apartemen', label: '🏢 Apartemen' },
          ]}
          selected={hotel.stars}
          onChange={val => onChange({ ...hotel, stars: val })}
          placeholder="Pilih bintang"
          label="Bintang"
        />
      )}

      {hotel.mode === 'distance' && (
        <RangeSlider
          min={0}
          max={2000}
          valueMin={hotel.distanceMin}
          valueMax={hotel.distanceMax}
          onChange={(min, max) => onChange({ ...hotel, distanceMin: min, distanceMax: max })}
          suffix="m"
        />
      )}

      {hotel.mode === 'name' && (
        <SearchableMultiSelect
          options={hotels.map(h => ({ value: h.name, label: h.name }))}
          selected={hotel.names}
          onChange={val => onChange({ ...hotel, names: val })}
          placeholder="Pilih hotel"
          label="Hotel"
        />
      )}
    </div>
  );
}

function PackageCard({ pkg }: { pkg: Package }) {
  const [showInfo, setShowInfo] = useState(false);
  const [liked, setLiked] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);
  };

  const getTransitLabel = () => {
    switch (pkg.transitType) {
      case 'direct': return 'Langsung';
      case 'transit_domestic_overnight': return `Transit Domestik (Menginap)`;
      case 'transit_domestic_no_overnight': return `Transit Domestik`;
      case 'transit_international_city_tour': return `Transit ${pkg.transitCity} (City Tour)`;
      case 'transit_international_no_city_tour': return `Transit ${pkg.transitCity}`;
      default: return '';
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{pkg.travelBrand}</span>
                {pkg.promo && (
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">PROMO</span>
                )}
              </div>
              <h3 className="text-lg font-bold text-gray-900">Paket Umroh {pkg.travelDays} Hari</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLiked(!liked)}
                className={`p-2 rounded-lg transition ${liked ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
              >
                <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
              </button>
              <button className="p-2 bg-gray-50 text-gray-400 hover:bg-gray-100 rounded-lg transition">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-gray-50 p-2.5 rounded-lg">
              <p className="text-xs text-gray-500 mb-0.5">📅 Berangkat</p>
              <p className="text-sm font-bold text-gray-900">{new Date(pkg.departureDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            </div>
            <div className="bg-gray-50 p-2.5 rounded-lg">
              <p className="text-xs text-gray-500 mb-0.5">⏱️ Durasi</p>
              <p className="text-sm font-bold text-gray-900">{pkg.travelDays} Hari</p>
            </div>
            <div className="bg-gray-50 p-2.5 rounded-lg">
              <p className="text-xs text-gray-500 mb-0.5">✈️ Penerbangan</p>
              <p className="text-sm font-bold text-gray-900 truncate">{getTransitLabel()}</p>
            </div>
            <div className="bg-gray-50 p-2.5 rounded-lg">
              <p className="text-xs text-gray-500 mb-0.5">🛫 Bandara</p>
              <p className="text-sm font-bold text-gray-900">{pkg.airportCode} - {pkg.airport}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="border border-gray-200 p-3 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">🕋 Hotel Makkah</p>
              <p className="text-sm font-bold text-gray-900">{pkg.makkahHotel.name}</p>
              <p className="text-xs text-gray-600">{'⭐'.repeat(parseInt(pkg.makkahHotel.stars))} • {pkg.makkahHotel.distance}m dari Haram</p>
            </div>
            <div className="border border-gray-200 p-3 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">🕌 Hotel Madinah</p>
              <p className="text-sm font-bold text-gray-900">{pkg.madinahHotel.name}</p>
              <p className="text-xs text-gray-600">{'⭐'.repeat(parseInt(pkg.madinahHotel.stars))} • {pkg.madinahHotel.distance}m dari Nabawi</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div>
              <div className="flex items-center gap-1 mb-1">
                <Star className="w-4 h-4 text-amber-400 fill-current" />
                <span className="text-sm font-bold text-gray-900">{pkg.rating}</span>
                <span className="text-xs text-gray-500">/ 5.0</span>
              </div>
              <p className="text-xs text-gray-500">{pkg.aircraft}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-1">Harga per orang</p>
              <p className="text-2xl font-bold text-emerald-600">{formatPrice(pkg.price)}</p>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setShowInfo(true)}
              className="flex-1 px-4 py-2.5 border border-emerald-600 text-emerald-600 rounded-lg text-sm font-medium hover:bg-emerald-50 transition"
            >
              Detail Paket
            </button>
            <button className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition flex items-center justify-center gap-2">
              <Phone className="w-4 h-4" />
              Hubungi Travel
            </button>
          </div>
        </div>
      </div>

      {showInfo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowInfo(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-6 rounded-t-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold">Paket Umroh {pkg.travelDays} Hari</h3>
                  <p className="text-emerald-100 mt-1">{pkg.travelBrand}</p>
                </div>
                <button onClick={() => setShowInfo(false)} className="p-1 hover:bg-white/20 rounded-lg transition">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Tanggal Berangkat</p>
                  <p className="text-sm text-gray-900 font-medium">{new Date(pkg.departureDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Durasi</p>
                  <p className="text-sm text-gray-900 font-medium">{pkg.travelDays} Hari</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Penerbangan</p>
                  <p className="text-sm text-gray-900 font-medium">{getTransitLabel()}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Maskapai</p>
                  <p className="text-sm text-gray-900 font-medium">{pkg.aircraft}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Bandara</p>
                  <p className="text-sm text-gray-900 font-medium">{pkg.airportCode} - {pkg.airport}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Rute Saudi</p>
                  <p className="text-sm text-gray-900 font-medium">{pkg.saudiRoute}</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-bold text-gray-900 mb-3">Penginapan</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-50 p-3 rounded-lg">
                    <p className="text-xs text-emerald-600 font-medium mb-1">🕋 Makkah</p>
                    <p className="text-sm font-bold text-gray-900">{pkg.makkahHotel.name}</p>
                    <p className="text-xs text-gray-600">{'⭐'.repeat(parseInt(pkg.makkahHotel.stars))} • {pkg.makkahHotel.distance}m</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs text-blue-600 font-medium mb-1">🕌 Madinah</p>
                    <p className="text-sm font-bold text-gray-900">{pkg.madinahHotel.name}</p>
                    <p className="text-xs text-gray-600">{'⭐'.repeat(parseInt(pkg.madinahHotel.stars))} • {pkg.madinahHotel.distance}m</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-bold text-gray-900 mb-3">Fasilitas Termasuk</h4>
                <div className="grid grid-cols-2 gap-2">
                  {pkg.includes.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Harga per orang</p>
                    <p className="text-3xl font-bold text-emerald-600">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(pkg.price)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-amber-400 fill-current" />
                    <span className="text-lg font-bold text-gray-900">{pkg.rating}</span>
                  </div>
                </div>
                <button className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition flex items-center justify-center gap-2">
                  <Phone className="w-5 h-5" />
                  Hubungi {pkg.contactPerson} - {pkg.contactPhone}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function formatDateShort(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

function getHotelLabel(hotel: Filters['makkahHotel'] | Filters['madinahHotel'], hotels: typeof makkahHotels) {
  if (hotel.mode === 'name' && hotel.names.length > 0) {
    return `${hotel.names.length} hotel`;
  } else if (hotel.mode === 'stars' && hotel.stars.length > 0) {
    return `${hotel.stars.length} bintang`;
  } else if (hotel.mode === 'distance' && (hotel.distanceMin > 0 || hotel.distanceMax < 2000)) {
    return `${hotel.distanceMin}-${hotel.distanceMax}m`;
  }
  return 'Semua';
}

export default App;
