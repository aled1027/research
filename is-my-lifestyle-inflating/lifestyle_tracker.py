#!/usr/bin/env python3
"""
Lifestyle Inflation Tracker

Analyzes financial data to detect and measure lifestyle inflation.
Particularly useful for those pursuing FIRE (Financial Independence, Retire Early).
"""

import json
import sys
from datetime import datetime
from typing import Dict, List, Optional
from dataclasses import dataclass
from enum import Enum


class AnalysisMode(Enum):
    """Available analysis modes"""
    SAVINGS_RATE = "savings"
    INFLATION = "inflation"
    CATEGORY = "category"
    DASHBOARD = "dashboard"


@dataclass
class MonthlyData:
    """Represents financial data for a single month"""
    date: str
    income: float
    savings: float
    total_spending: float
    categories: Dict[str, float]
    essential_categories: List[str]
    net_worth: Optional[float] = None
    cpi: Optional[float] = None  # Consumer Price Index for inflation adjustment


class LifestyleTracker:
    """Main tracker class for analyzing lifestyle inflation"""

    def __init__(self, data: List[MonthlyData]):
        self.data = sorted(data, key=lambda x: x.date)
        if not self.data:
            raise ValueError("No data provided")

    def calculate_savings_rate(self, month: MonthlyData) -> float:
        """Calculate savings rate as percentage of income"""
        if month.income == 0:
            return 0.0
        return (month.savings / month.income) * 100

    def calculate_discretionary_ratio(self, month: MonthlyData) -> float:
        """Calculate discretionary spending as percentage of total spending"""
        if month.total_spending == 0:
            return 0.0

        essential_spending = sum(
            amount for cat, amount in month.categories.items()
            if cat in month.essential_categories
        )
        discretionary_spending = month.total_spending - essential_spending
        return (discretionary_spending / month.total_spending) * 100

    def calculate_personal_inflation_rate(self, current_idx: int) -> Optional[float]:
        """Calculate year-over-year spending growth rate"""
        if current_idx == 0:
            return None

        current = self.data[current_idx]
        previous = self.data[current_idx - 1]

        if previous.total_spending == 0:
            return None

        return ((current.total_spending - previous.total_spending) /
                previous.total_spending) * 100

    def calculate_fi_ratio(self, month: MonthlyData) -> Optional[float]:
        """Calculate FI ratio (net worth / (annual expenses * 25))"""
        if month.net_worth is None:
            return None

        annual_expenses = month.total_spending * 12
        fi_number = annual_expenses * 25

        if fi_number == 0:
            return None

        return (month.net_worth / fi_number) * 100

    def analyze_savings_rate(self) -> str:
        """Analyze savings rate trends over time"""
        output = []
        output.append("\n" + "="*70)
        output.append("SAVINGS RATE ANALYSIS")
        output.append("="*70 + "\n")

        rates = []
        for month in self.data:
            rate = self.calculate_savings_rate(month)
            rates.append((month.date, rate, month.income))

        # Summary statistics
        avg_rate = sum(r[1] for r in rates) / len(rates)
        max_rate = max(rates, key=lambda x: x[1])
        min_rate = min(rates, key=lambda x: x[1])

        output.append(f"Average Savings Rate: {avg_rate:.1f}%")
        output.append(f"Highest: {max_rate[1]:.1f}% ({max_rate[0]})")
        output.append(f"Lowest: {min_rate[1]:.1f}% ({min_rate[0]})")
        output.append("")

        # Trend analysis
        if len(rates) >= 2:
            first_half_avg = sum(r[1] for r in rates[:len(rates)//2]) / (len(rates)//2)
            second_half_avg = sum(r[1] for r in rates[len(rates)//2:]) / (len(rates) - len(rates)//2)
            trend = second_half_avg - first_half_avg

            output.append(f"Trend: {'+' if trend > 0 else ''}{trend:.1f} percentage points")

            if trend < -5:
                output.append("⚠️  WARNING: Significant decline in savings rate!")
                output.append("   This indicates lifestyle inflation may be occurring.")
            elif trend < 0:
                output.append("⚠️  CAUTION: Savings rate is declining")
            elif trend > 5:
                output.append("✓  EXCELLENT: Savings rate is improving significantly")
            else:
                output.append("✓  Good: Savings rate is stable or improving slightly")

        output.append("\nMonthly Breakdown:")
        output.append("-" * 70)
        output.append(f"{'Date':<12} {'Income':>12} {'Savings Rate':>15} {'Status':>15}")
        output.append("-" * 70)

        for date, rate, income in rates[-12:]:  # Last 12 months
            status = "✓" if rate >= 50 else "⚠" if rate >= 20 else "✗"
            output.append(f"{date:<12} ${income:>11,.2f} {rate:>14.1f}% {status:>15}")

        return "\n".join(output)

    def analyze_inflation(self) -> str:
        """Analyze personal inflation rate vs CPI"""
        output = []
        output.append("\n" + "="*70)
        output.append("INFLATION ANALYSIS")
        output.append("="*70 + "\n")

        inflation_data = []
        for idx, month in enumerate(self.data):
            personal_rate = self.calculate_personal_inflation_rate(idx)
            if personal_rate is not None:
                inflation_data.append((month.date, personal_rate, month.cpi, month.total_spending))

        if not inflation_data:
            output.append("Insufficient data for inflation analysis (need at least 2 periods)")
            return "\n".join(output)

        avg_personal = sum(d[1] for d in inflation_data) / len(inflation_data)
        output.append(f"Average Personal Inflation Rate: {avg_personal:.1f}%")

        if inflation_data[0][2] is not None:
            avg_cpi = sum(d[2] for d in inflation_data if d[2] is not None) / len([d for d in inflation_data if d[2] is not None])
            output.append(f"Average CPI Inflation Rate: {avg_cpi:.1f}%")
            output.append(f"Difference: {avg_personal - avg_cpi:+.1f} percentage points")
            output.append("")

            if avg_personal > avg_cpi + 2:
                output.append("⚠️  WARNING: Your spending is growing faster than inflation!")
                output.append("   This suggests lifestyle inflation is occurring.")
            elif avg_personal > avg_cpi:
                output.append("⚠️  CAUTION: Spending growth slightly exceeds inflation")
            else:
                output.append("✓  Good: Spending growth is at or below inflation")

        output.append("\nPeriod-over-Period Breakdown:")
        output.append("-" * 70)
        output.append(f"{'Date':<12} {'Spending':>12} {'Personal':>12} {'CPI':>8} {'Status':>15}")
        output.append("-" * 70)

        for date, p_rate, cpi, spending in inflation_data[-12:]:
            if cpi is not None:
                status = "⚠" if p_rate > cpi + 2 else "✓"
                cpi_str = f"{cpi:.1f}%"
            else:
                status = "?"
                cpi_str = "N/A"

            output.append(f"{date:<12} ${spending:>11,.2f} {p_rate:>11.1f}% {cpi_str:>8} {status:>15}")

        return "\n".join(output)

    def analyze_categories(self) -> str:
        """Analyze spending by category"""
        output = []
        output.append("\n" + "="*70)
        output.append("CATEGORY ANALYSIS")
        output.append("="*70 + "\n")

        # Get all categories
        all_categories = set()
        for month in self.data:
            all_categories.update(month.categories.keys())

        # Calculate averages and trends for each category
        category_stats = {}
        for cat in all_categories:
            amounts = [m.categories.get(cat, 0) for m in self.data]
            avg = sum(amounts) / len(amounts)

            # Calculate trend
            if len(amounts) >= 2:
                first_half = amounts[:len(amounts)//2]
                second_half = amounts[len(amounts)//2:]
                first_avg = sum(first_half) / len(first_half)
                second_avg = sum(second_half) / len(second_half)

                if first_avg > 0:
                    growth_rate = ((second_avg - first_avg) / first_avg) * 100
                else:
                    growth_rate = 0
            else:
                growth_rate = 0

            is_essential = cat in self.data[0].essential_categories
            category_stats[cat] = {
                'avg': avg,
                'growth_rate': growth_rate,
                'essential': is_essential,
                'recent': amounts[-1] if amounts else 0
            }

        # Sort by growth rate (descending) to find inflation hotspots
        sorted_cats = sorted(category_stats.items(), key=lambda x: x[1]['growth_rate'], reverse=True)

        # Essential vs Discretionary summary
        essential_total = sum(s['avg'] for c, s in category_stats.items() if s['essential'])
        discretionary_total = sum(s['avg'] for c, s in category_stats.items() if not s['essential'])
        total = essential_total + discretionary_total

        output.append("Spending Breakdown:")
        output.append(f"  Essential:     ${essential_total:>10,.2f}/mo ({essential_total/total*100:.1f}%)")
        output.append(f"  Discretionary: ${discretionary_total:>10,.2f}/mo ({discretionary_total/total*100:.1f}%)")
        output.append(f"  Total:         ${total:>10,.2f}/mo")
        output.append("")

        # Inflation hotspots
        output.append("Lifestyle Inflation Hotspots (Highest Growth):")
        output.append("-" * 70)
        output.append(f"{'Category':<25} {'Type':<12} {'Avg/Month':>12} {'Growth':>10}")
        output.append("-" * 70)

        for cat, stats in sorted_cats[:10]:
            cat_type = "Essential" if stats['essential'] else "Discretionary"
            status = "⚠️" if stats['growth_rate'] > 20 and not stats['essential'] else ""
            output.append(f"{cat:<25} {cat_type:<12} ${stats['avg']:>11,.2f} {stats['growth_rate']:>9.1f}% {status}")

        output.append("\n")
        output.append("Key Insights:")

        # Identify concerning trends
        high_growth_discretionary = [
            (cat, stats) for cat, stats in sorted_cats
            if not stats['essential'] and stats['growth_rate'] > 20 and stats['avg'] > 50
        ]

        if high_growth_discretionary:
            output.append("⚠️  Categories with significant lifestyle inflation:")
            for cat, stats in high_growth_discretionary[:5]:
                output.append(f"   - {cat}: {stats['growth_rate']:.1f}% growth (${stats['avg']:.2f}/mo avg)")
        else:
            output.append("✓  No major discretionary spending inflation detected")

        return "\n".join(output)

    def generate_dashboard(self) -> str:
        """Generate comprehensive dashboard with all metrics"""
        output = []
        output.append("\n" + "="*70)
        output.append("LIFESTYLE INFLATION DASHBOARD")
        output.append("="*70 + "\n")

        latest = self.data[-1]

        # Key Metrics
        output.append("Current Status (Most Recent Period):")
        output.append("-" * 70)

        savings_rate = self.calculate_savings_rate(latest)
        output.append(f"  Savings Rate:        {savings_rate:.1f}%")

        discr_ratio = self.calculate_discretionary_ratio(latest)
        output.append(f"  Discretionary Ratio: {discr_ratio:.1f}%")

        fi_ratio = self.calculate_fi_ratio(latest)
        if fi_ratio is not None:
            output.append(f"  FI Ratio:            {fi_ratio:.1f}%")

        output.append(f"  Monthly Spending:    ${latest.total_spending:,.2f}")
        output.append(f"  Monthly Income:      ${latest.income:,.2f}")
        output.append("")

        # Overall Assessment
        output.append("Overall Assessment:")
        output.append("-" * 70)

        warnings = []
        positives = []

        # Check savings rate trend
        if len(self.data) >= 6:
            recent_rates = [self.calculate_savings_rate(m) for m in self.data[-6:]]
            early_rates = [self.calculate_savings_rate(m) for m in self.data[:min(6, len(self.data))]]
            rate_change = sum(recent_rates)/len(recent_rates) - sum(early_rates)/len(early_rates)

            if rate_change < -5:
                warnings.append("Savings rate has declined significantly")
            elif rate_change > 5:
                positives.append("Savings rate has improved significantly")

        # Check spending growth
        if len(self.data) >= 3:
            spending_growth = ((latest.total_spending - self.data[0].total_spending) /
                             self.data[0].total_spending) * 100
            if spending_growth > 30:
                warnings.append(f"Total spending has grown {spending_growth:.1f}%")

        # Check discretionary ratio
        if discr_ratio > 40:
            warnings.append("High discretionary spending ratio")
        elif discr_ratio < 25:
            positives.append("Controlled discretionary spending")

        if warnings:
            output.append("⚠️  Areas of Concern:")
            for w in warnings:
                output.append(f"   - {w}")

        if positives:
            output.append("✓  Positive Indicators:")
            for p in positives:
                output.append(f"   - {p}")

        if not warnings and not positives:
            output.append("✓  Financial habits appear stable")

        # Add detailed sections
        output.append("\n" + self.analyze_savings_rate())
        output.append("\n" + self.analyze_inflation())
        output.append("\n" + self.analyze_categories())

        return "\n".join(output)


def load_data(filepath: str) -> List[MonthlyData]:
    """Load financial data from JSON file"""
    with open(filepath, 'r') as f:
        data = json.load(f)

    monthly_data = []
    for entry in data:
        monthly_data.append(MonthlyData(
            date=entry['date'],
            income=float(entry['income']),
            savings=float(entry['savings']),
            total_spending=float(entry['total_spending']),
            categories=entry['categories'],
            essential_categories=entry['essential_categories'],
            net_worth=float(entry.get('net_worth')) if entry.get('net_worth') is not None else None,
            cpi=float(entry.get('cpi')) if entry.get('cpi') is not None else None
        ))

    return monthly_data


def main():
    """Main entry point"""
    if len(sys.argv) < 2:
        print("Usage: python lifestyle_tracker.py <data_file.json> [mode]")
        print("\nModes:")
        print("  savings    - Savings rate analysis (quick check)")
        print("  inflation  - Personal inflation rate analysis")
        print("  category   - Category-specific analysis")
        print("  dashboard  - Full dashboard (default)")
        print("\nExample: python lifestyle_tracker.py my_finances.json savings")
        sys.exit(1)

    filepath = sys.argv[1]
    mode = sys.argv[2] if len(sys.argv) > 2 else 'dashboard'

    try:
        data = load_data(filepath)
        tracker = LifestyleTracker(data)

        if mode == 'savings':
            print(tracker.analyze_savings_rate())
        elif mode == 'inflation':
            print(tracker.analyze_inflation())
        elif mode == 'category':
            print(tracker.analyze_categories())
        elif mode == 'dashboard':
            print(tracker.generate_dashboard())
        else:
            print(f"Unknown mode: {mode}")
            sys.exit(1)

    except FileNotFoundError:
        print(f"Error: File not found: {filepath}")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in file: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
