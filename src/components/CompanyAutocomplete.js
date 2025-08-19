'use client'

import { useState, useEffect, useRef } from 'react'

export default function CompanyAutocomplete({ 
  value, 
  onChange, 
  placeholder = "Enter company name (e.g., Oracle, Microsoft)...",
  label = "Company",
  required = false 
}) {
  const [inputValue, setInputValue] = useState(value || '')
  const [isSearching, setIsSearching] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [selectedCompany, setSelectedCompany] = useState(null)
  const dropdownRef = useRef(null)
  const inputRef = useRef(null)
  const searchTimeoutRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Search for companies as user types
  const searchCompanies = async (query) => {
    if (!query || query.length < 2) {
      setSuggestions([])
      setShowDropdown(false)
      return
    }

    setIsSearching(true)
    
    try {
      const response = await fetch('/api/search-companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.companies && data.companies.length > 0) {
          setSuggestions(data.companies)
          setShowDropdown(true)
          setSelectedIndex(-1)
        } else {
          // If no companies found, allow manual entry
          setSuggestions([{
            name: query,
            symbol: 'CUSTOM',
            description: 'Use custom company name',
            isCustom: true
          }])
          setShowDropdown(true)
        }
      }
    } catch (error) {
      console.error('Search error:', error)
      // On error, allow manual entry
      setSuggestions([{
        name: query,
        symbol: 'CUSTOM',
        description: 'Use custom company name',
        isCustom: true
      }])
      setShowDropdown(true)
    } finally {
      setIsSearching(false)
    }
  }

  // Handle input change with debounced search
  const handleInputChange = (e) => {
    const newValue = e.target.value
    setInputValue(newValue)
    setSelectedCompany(null)
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Set new timeout for search
    searchTimeoutRef.current = setTimeout(() => {
      searchCompanies(newValue)
    }, 300) // 300ms debounce
  }

  // Handle company selection
  const selectCompany = (company) => {
    const companyName = company.name
    setInputValue(companyName)
    onChange(companyName)
    setSelectedCompany(company)
    setShowDropdown(false)
    setSuggestions([])
  }

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showDropdown || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          selectCompany(suggestions[selectedIndex])
        }
        break
      
      case 'Escape':
        setShowDropdown(false)
        break
    }
  }

  // Format large numbers
  const formatNumber = (num) => {
    if (!num || num === 'N/A') return num
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-900 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (inputValue.length >= 2) {
              searchCompanies(inputValue)
            }
          }}
          placeholder={placeholder}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all pr-10 placeholder-gray-700 text-gray-900"
          autoComplete="off"
          required={required}
        />

        {/* Status indicator */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {isSearching && (
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          )}
          {!isSearching && selectedCompany && !selectedCompany.isCustom && (
            <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>

      {/* Dropdown with company suggestions */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-96 overflow-y-auto">
          {suggestions.map((company, index) => (
            <div
              key={index}
              onClick={() => selectCompany(company)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`p-4 cursor-pointer transition-all ${
                index === selectedIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
              } ${index > 0 ? 'border-t border-gray-100' : ''}`}
            >
              {company.isCustom ? (
                // Custom company entry
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">
                      Use "{company.name}"
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Company not found - proceed with custom name
                    </div>
                  </div>
                  <span className="text-gray-400">
                    Press Enter to use
                  </span>
                </div>
              ) : (
                // Real company from search
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 text-lg">
                        {company.name}
                      </span>
                      {company.symbol && company.symbol !== 'N/A' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {company.symbol}
                        </span>
                      )}
                    </div>
                    {company.description && (
                      <div className="text-sm text-gray-600 mt-1">
                        {company.description}
                      </div>
                    )}
                    {/* Show key metrics if available */}
                    <div className="flex gap-4 mt-2 text-xs text-gray-600">
                      {company.marketCap && company.marketCap !== 'N/A' && (
                        <span>Market Cap: {company.marketCap}</span>
                      )}
                      {company.employees && company.employees !== 'N/A' && (
                        <span>Employees: {formatNumber(company.employees)}</span>
                      )}
                    </div>
                  </div>
                  {company.currentPrice && company.currentPrice !== 'N/A' && (
                    <div className="text-right ml-4">
                      <div className="text-lg font-semibold text-gray-900">
                        {company.currentPrice}
                      </div>
                      {company.dayChange && company.dayChange !== 'N/A' && (
                        <div className={`text-sm font-medium ${
                          company.dayChange.startsWith('-') ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {company.dayChange}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Selected company indicator */}
      {selectedCompany && !selectedCompany.isCustom && (
        <p className="mt-1 text-xs text-green-600">
          ✓ {selectedCompany.name} selected
        </p>
      )}
    </div>
  )
}