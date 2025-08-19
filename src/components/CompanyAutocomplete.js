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
  const [isValidating, setIsValidating] = useState(false)
  const [showSuggestion, setShowSuggestion] = useState(false)
  const [validatedCompany, setValidatedCompany] = useState(null)
  const [validationMessage, setValidationMessage] = useState('')
  const dropdownRef = useRef(null)
  const inputRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSuggestion(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Handle input change
  const handleInputChange = (e) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange(newValue)
    setValidatedCompany(null)
    setShowSuggestion(false)
    setValidationMessage('')
  }

  // Validate company when user finishes typing (on blur)
  const validateCompany = async () => {
    if (!inputValue || inputValue.length < 2) {
      setValidationMessage('')
      return
    }

    setIsValidating(true)
    setValidationMessage('Validating company...')
    
    try {
      const response = await fetch('/api/validate-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: inputValue })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.found && data.company) {
          setValidatedCompany(data.company)
          setShowSuggestion(true)
          setValidationMessage('')
        } else {
          // Company not found in stock market, but allow user to continue
          setValidatedCompany(null)
          setShowSuggestion(false)
          setValidationMessage('Company not found in stock market. You can still proceed with this name.')
        }
      }
    } catch (error) {
      console.error('Validation error:', error)
      setValidationMessage('Unable to validate. You can still proceed with this name.')
    } finally {
      setIsValidating(false)
    }
  }

  // Handle company confirmation
  const confirmCompany = (company) => {
    const companyName = company.name
    setInputValue(companyName)
    onChange(companyName)
    setValidatedCompany(company)
    setShowSuggestion(false)
    setValidationMessage('✓ Company validated')
  }

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestion || !validatedCompany) return

    switch (e.key) {
      case 'Enter':
        e.preventDefault()
        confirmCompany(validatedCompany)
        break
      
      case 'Escape':
        setShowSuggestion(false)
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
          onBlur={validateCompany}
          onFocus={() => {
            if (validatedCompany) {
              setShowSuggestion(true)
            }
          }}
          placeholder={placeholder}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all pr-10"
          autoComplete="off"
          required={required}
        />

        {/* Status indicator */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {isValidating && (
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          )}
          {!isValidating && validatedCompany && (
            <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>

      {/* Single company suggestion after validation */}
      {showSuggestion && validatedCompany && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl">
          <div
            onClick={() => confirmCompany(validatedCompany)}
            className="p-4 cursor-pointer transition-all hover:bg-blue-50"
          >
            {/* Company header */}
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 text-lg">
                    {validatedCompany.name}
                  </span>
                  {validatedCompany.symbol && validatedCompany.symbol !== 'N/A' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {validatedCompany.symbol}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-900 mt-1">
                  {validatedCompany.description || validatedCompany.industry || 'Click to confirm this company'}
                </div>
              </div>
              {validatedCompany.currentPrice && validatedCompany.currentPrice !== 'N/A' && (
                <div className="text-right ml-4">
                  <div className="text-lg font-semibold text-gray-900">
                    {validatedCompany.currentPrice}
                  </div>
                  {validatedCompany.dayChange && validatedCompany.dayChange !== 'N/A' && (
                    <div className={`text-sm font-medium ${
                      validatedCompany.dayChange.startsWith('-') ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {validatedCompany.dayChange}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Company details grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              {validatedCompany.marketCap && validatedCompany.marketCap !== 'N/A' && (
                <div>
                  <span className="text-gray-900">Market Cap:</span>
                  <span className="ml-1 font-medium text-gray-900">{validatedCompany.marketCap}</span>
                </div>
              )}
              {validatedCompany.revenue && validatedCompany.revenue !== 'N/A' && (
                <div>
                  <span className="text-gray-900">Revenue:</span>
                  <span className="ml-1 font-medium text-gray-900">{validatedCompany.revenue}</span>
                </div>
              )}
              {validatedCompany.employees && validatedCompany.employees !== 'N/A' && (
                <div>
                  <span className="text-gray-900">Employees:</span>
                  <span className="ml-1 font-medium text-gray-900">{formatNumber(validatedCompany.employees)}</span>
                </div>
              )}
              {validatedCompany.sector && (
                <div>
                  <span className="text-gray-900">Sector:</span>
                  <span className="ml-1 font-medium text-gray-900">{validatedCompany.sector}</span>
                </div>
              )}
            </div>

            {/* Additional info if available */}
            {validatedCompany.fiftyTwoWeekRange && validatedCompany.fiftyTwoWeekRange !== 'N/A' && (
              <div className="mt-2 text-xs text-gray-900">
                52-Week Range: {validatedCompany.fiftyTwoWeekRange}
              </div>
            )}
            
            <div className="mt-3 text-sm text-green-600 font-medium">
              ✓ Click to confirm this is the correct company
            </div>
          </div>
        </div>
      )}

      {/* Validation message */}
      {validationMessage && (
        <p className={`mt-1 text-xs ${
          validationMessage.includes('✓') ? 'text-green-600' : 
          validationMessage.includes('not found') ? 'text-amber-600' : 
          'text-gray-900'
        }`}>
          {validationMessage}
        </p>
      )}
    </div>
  )
}