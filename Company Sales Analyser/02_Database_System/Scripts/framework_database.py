#!/usr/bin/env python3
"""
Company Analysis Database Handler
Manages storage and retrieval of B2B sales analyses
"""

import sqlite3
import json
import os
from datetime import datetime
from pathlib import Path

class AnalysisDatabase:
    def __init__(self, db_path="company_analyses.db"):
        """Initialize database connection"""
        self.db_path = db_path
        self.conn = sqlite3.connect(db_path)
        self.create_tables()
    
    def create_tables(self):
        """Create database tables if they don't exist"""
        cursor = self.conn.cursor()
        
        # Main analyses table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS analyses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                company_name TEXT NOT NULL,
                analysis_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                overall_score REAL,
                industry_fit TEXT,
                opportunities TEXT,
                challenges TEXT,
                framework_json TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Scoring dimensions table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS scoring_dimensions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                analysis_id INTEGER,
                dimension_name TEXT,
                score REAL,
                rationale TEXT,
                FOREIGN KEY (analysis_id) REFERENCES analyses(id)
            )
        ''')
        
        self.conn.commit()
    
    def add_analysis(self, company_name, analysis_data):
        """Add a new company analysis to the database"""
        cursor = self.conn.cursor()
        
        # Insert main analysis
        cursor.execute('''
            INSERT INTO analyses (
                company_name, 
                overall_score, 
                industry_fit,
                opportunities,
                challenges,
                framework_json
            ) VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            company_name,
            analysis_data.get('overall_score', 0),
            analysis_data.get('industry_fit', ''),
            json.dumps(analysis_data.get('opportunities', [])),
            json.dumps(analysis_data.get('challenges', [])),
            json.dumps(analysis_data)
        ))
        
        analysis_id = cursor.lastrowid
        
        # Insert scoring dimensions
        for dimension in analysis_data.get('scoring_dimensions', []):
            cursor.execute('''
                INSERT INTO scoring_dimensions (
                    analysis_id,
                    dimension_name,
                    score,
                    rationale
                ) VALUES (?, ?, ?, ?)
            ''', (
                analysis_id,
                dimension.get('name'),
                dimension.get('score'),
                dimension.get('rationale')
            ))
        
        self.conn.commit()
        return analysis_id
    
    def get_analysis(self, company_name):
        """Retrieve analysis for a specific company"""
        cursor = self.conn.cursor()
        cursor.execute('''
            SELECT * FROM analyses 
            WHERE company_name = ? 
            ORDER BY created_at DESC 
            LIMIT 1
        ''', (company_name,))
        
        result = cursor.fetchone()
        if result:
            return {
                'id': result[0],
                'company_name': result[1],
                'analysis_date': result[2],
                'overall_score': result[3],
                'industry_fit': result[4],
                'opportunities': json.loads(result[5]),
                'challenges': json.loads(result[6]),
                'framework': json.loads(result[7])
            }
        return None
    
    def get_all_analyses(self):
        """Retrieve all analyses"""
        cursor = self.conn.cursor()
        cursor.execute('SELECT * FROM analyses ORDER BY created_at DESC')
        
        analyses = []
        for row in cursor.fetchall():
            analyses.append({
                'id': row[0],
                'company_name': row[1],
                'analysis_date': row[2],
                'overall_score': row[3],
                'industry_fit': row[4]
            })
        return analyses
    
    def find_patterns(self):
        """Find patterns across all analyses"""
        cursor = self.conn.cursor()
        
        # Average scores by dimension
        cursor.execute('''
            SELECT 
                dimension_name,
                AVG(score) as avg_score,
                COUNT(*) as count
            FROM scoring_dimensions
            GROUP BY dimension_name
            ORDER BY avg_score DESC
        ''')
        
        patterns = {
            'dimension_averages': cursor.fetchall(),
            'total_analyses': len(self.get_all_analyses())
        }
        
        return patterns
    
    def close(self):
        """Close database connection"""
        self.conn.close()

# Example usage
if __name__ == "__main__":
    db = AnalysisDatabase()
    
    # Example analysis data
    sample_analysis = {
        'overall_score': 78,
        'industry_fit': 'Strong alignment with enterprise needs',
        'opportunities': [
            'Digital transformation initiative',
            'Process automation potential',
            'Cost reduction opportunity'
        ],
        'challenges': [
            'Long sales cycle expected',
            'Multiple stakeholders involved'
        ],
        'scoring_dimensions': [
            {'name': 'Market Alignment', 'score': 8, 'rationale': 'Perfect fit'},
            {'name': 'Budget Readiness', 'score': 7, 'rationale': 'Budget available'}
        ]
    }
    
    # Add analysis
    analysis_id = db.add_analysis('Sample Company', sample_analysis)
    print(f"Added analysis with ID: {analysis_id}")
    
    # Retrieve analysis
    retrieved = db.get_analysis('Sample Company')
    print(f"Retrieved analysis: {retrieved}")
    
    db.close()