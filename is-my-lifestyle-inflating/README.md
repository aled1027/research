# Is My Lifestyle Inflating?

A Python-based tool to detect and measure lifestyle inflation, particularly useful for those pursuing FIRE (Financial Independence, Retire Early).

## Problem Statement

Lifestyle inflation (also called lifestyle creep) is the tendency to increase spending as income rises, potentially derailing long-term financial goals. It's challenging to detect because:

- It's often gradual and category-specific
- It's complicated by monetary inflation (CPI)
- Some spending increases are appropriate (life stage changes)
- It involves both psychological and financial factors

For FIRE-focused individuals, controlling lifestyle inflation is critical to maintaining high savings rates and reaching financial independence.

## Solution Overview

This tool provides multiple analytical approaches to detect lifestyle inflation by examining:

1. **Savings Rate Trends** - The primary early warning indicator
2. **Personal vs. Economic Inflation** - Spending growth vs. CPI
3. **Category-Specific Analysis** - Identifying inflation hotspots
4. **Discretionary Spending Patterns** - Tracking "wants" vs. "needs"
5. **FIRE Progress Metrics** - FI ratio and trajectory

## Key Metrics Explained

### 1. Savings Rate (Primary Indicator)

```
Savings Rate = (Savings / Income) × 100
```

**Why it matters**: This is the single most important metric for detecting lifestyle inflation. If your savings rate declines while income increases, lifestyle inflation is occurring.

**FIRE targets**:
- Minimum: 20% (28 years to FI)
- Good: 50% (17 years to FI)
- Aggressive: 70%+ (<10 years to FI)

### 2. Personal Inflation Rate

```
Personal Inflation = (Current Spending - Previous Spending) / Previous Spending × 100
```

**Why it matters**: Compares your spending growth to CPI. If consistently higher than CPI, your lifestyle is inflating beyond economic inflation.

### 3. Discretionary Spending Ratio

```
Discretionary Ratio = Discretionary Spending / Total Spending × 100
```

**Why it matters**: Tracks the portion of spending that's flexible. High or growing discretionary ratios indicate potential for lifestyle inflation.

**Categories**:
- **Essential**: Housing, groceries, transportation, insurance, utilities
- **Discretionary**: Dining out, entertainment, shopping, subscriptions, travel

### 4. FI Ratio (Context Metric)

```
FI Ratio = Net Worth / (Annual Expenses × 25) × 100
```

**Why it matters**: Shows progress to financial independence based on the 4% rule. At 100%, you're financially independent.

## Installation & Usage

### Requirements

- Python 3.6+
- No external dependencies (uses only standard library)

### Quick Start

1. Prepare your financial data in JSON format (see `example_data.json`)
2. Run the analysis:

```bash
# Quick savings rate check
python lifestyle_tracker.py your_data.json savings

# Inflation analysis
python lifestyle_tracker.py your_data.json inflation

# Category breakdown
python lifestyle_tracker.py your_data.json category

# Full dashboard (default)
python lifestyle_tracker.py your_data.json dashboard
```

### Data Format

Create a JSON file with your monthly financial data:

```json
[
  {
    "date": "2024-01",
    "income": 8000,
    "savings": 4000,
    "total_spending": 4000,
    "categories": {
      "housing": 1500,
      "groceries": 600,
      "dining_out": 400,
      "entertainment": 300
    },
    "essential_categories": ["housing", "groceries"],
    "net_worth": 150000,
    "cpi": 3.1
  }
]
```

**Required fields**:
- `date`: Period identifier (e.g., "2024-01")
- `income`: Total monthly income
- `savings`: Amount saved this month
- `total_spending`: Total monthly spending
- `categories`: Spending breakdown by category
- `essential_categories`: List of essential category names

**Optional fields**:
- `net_worth`: For FI ratio calculation
- `cpi`: Consumer Price Index for inflation comparison

## Analysis Modes

### 1. Savings Rate Mode (`savings`)

**Best for**: Quick monthly check-ins

**Provides**:
- Average, highest, and lowest savings rates
- Trend analysis (first half vs. second half)
- Monthly breakdown with status indicators
- Warnings for declining rates

**When to use**: Regular monitoring, especially after income changes

### 2. Inflation Mode (`inflation`)

**Best for**: Understanding if spending growth is justified

**Provides**:
- Personal inflation rate vs. CPI comparison
- Period-over-period spending analysis
- Identification of months with excessive growth
- Economic context for spending changes

**When to use**: Annual reviews, when questioning if spending increases are reasonable

### 3. Category Mode (`category`)

**Best for**: Identifying specific problem areas

**Provides**:
- Essential vs. discretionary spending breakdown
- Growth rates by category
- Lifestyle inflation hotspots
- Specific recommendations for categories with high growth

**When to use**: Deep dives when you know inflation is happening but want to find the source

### 4. Dashboard Mode (`dashboard`)

**Best for**: Comprehensive quarterly/annual reviews

**Provides**:
- All metrics combined
- Overall assessment with warnings and positives
- Complete picture of financial health
- Trend analysis across all dimensions

**When to use**: Major financial check-ins, annual planning

## Example Output

Here's what the tool detected from the example data (12 months showing gradual lifestyle inflation):

### Savings Rate Analysis
```
Average Savings Rate: 41.6%
Trend: -8.9 percentage points
⚠️  WARNING: Significant decline in savings rate!
```

### Category Analysis
```
Lifestyle Inflation Hotspots:
entertainment:  +98.3% growth ($576.67/mo avg) ⚠️
dining_out:     +73.0% growth ($716.67/mo avg) ⚠️
shopping:       +66.1% growth ($614.17/mo avg) ⚠️
subscriptions:  +50.0% growth ($145.83/mo avg) ⚠️
```

### Inflation Analysis
```
Average Personal Inflation Rate: 4.2%
Average CPI Inflation Rate: 2.9%
Difference: +1.3 percentage points
⚠️  CAUTION: Spending growth slightly exceeds inflation
```

## Research Findings

### What the FIRE Community Recommends

Based on research from leading FIRE resources (Minafi, Physician on FIRE, Mr. Money Mustache community):

1. **Track savings rate monthly** when starting your FIRE journey
2. **Switch to quarterly tracking** once budgeting is comfortable
3. **Focus on discretionary categories** as they're the usual culprits
4. **Expect some lifestyle inflation** but keep it below income growth
5. **Personal inflation should stay near or below CPI** in the long run

### Common Lifestyle Inflation Patterns

Research identified these typical patterns:

- **Subscription creep**: Adding services without removing old ones
- **Dining inflation**: More frequent restaurant visits or pricier venues
- **Shopping normalization**: Higher baseline for "normal" purchases
- **Entertainment escalation**: More expensive hobbies or activities
- **Convenience spending**: Paying for time-savers as income rises

### The Psychological Shift

A key insight from the research: former luxuries become "new necessities" psychologically. What feels like a "need" may actually be lifestyle inflation.

## Interpreting Results

### Red Flags (Investigate Further)

- Savings rate declining >5 percentage points
- Personal inflation >2 points above CPI consistently
- Discretionary ratio >40% of total spending
- Discretionary categories growing >20% year-over-year
- Income rising but savings rate flat or declining

### Green Flags (Healthy Patterns)

- Stable or improving savings rate despite income changes
- Personal inflation at or below CPI
- Discretionary spending controlled (<30% of total)
- Essential spending well-managed
- Growing income leading to growing savings

### Context Matters

Not all spending increases are bad:
- Family growth (children, elder care)
- Health investments
- Education and career development
- Appropriate housing upgrades for life stage
- Geographical inflation (cost of living changes)

The tool helps you see the numbers; you provide the context.

## Best Practices for FIRE Seekers

### 1. Establish a Baseline
Track at least 3-6 months before making judgments. This establishes your normal patterns.

### 2. Regular Check-ins
- **Monthly**: Quick savings rate check
- **Quarterly**: Category analysis
- **Annually**: Full dashboard review

### 3. Set Targets
Define your personal targets:
- Minimum acceptable savings rate
- Maximum discretionary ratio
- Category-specific budgets

### 4. Use All Modes
Each analysis mode provides different insights:
- Savings mode catches the problem
- Inflation mode quantifies it
- Category mode locates it
- Dashboard mode contextualizes it

### 5. Combine with Other Tools
This tool works best alongside:
- Budget tracking (Mint, YNAB, Personal Capital)
- Net worth tracking
- FIRE calculators
- Spending apps

## Limitations

- **Manual data entry**: Requires compiling your financial data
- **Category classification**: You must decide what's essential vs. discretionary
- **Doesn't track income sources**: Focuses on spending patterns
- **No forecasting**: Shows trends but doesn't predict future
- **Subjective judgments**: Only you can decide if increases are appropriate

## Future Enhancements

Potential additions (not implemented):
- CSV import from banking apps
- Automated category classification
- Graphical visualizations
- Forecasting models
- Budget recommendations
- Integration with financial APIs

## Files Included

- `lifestyle_tracker.py` - Main analysis tool (450 lines)
- `example_data.json` - Sample dataset with gradual lifestyle inflation
- `notes.md` - Development notes and research findings
- `README.md` - This file

## Key Takeaways

1. **Savings rate is your canary in the coal mine** - Watch it closely
2. **Lifestyle inflation is often category-specific** - Don't just look at totals
3. **Context matters** - Numbers need interpretation
4. **Regular monitoring prevents major drift** - Monthly check-ins catch problems early
5. **Multiple metrics tell the full story** - Use all analysis modes

## Resources

This tool was developed based on research from:
- FIRE movement calculators and tracking methodologies
- Personal finance metrics from the FIRE community
- Academic research on spending patterns and savings behavior
- Practical guidance from early retirees and FIRE bloggers

## Conclusion

Lifestyle inflation is subtle and non-linear, but with systematic tracking, it's detectable and controllable. This tool provides the framework to:

1. **Detect** inflation early through savings rate monitoring
2. **Quantify** it against economic inflation (CPI)
3. **Locate** specific problem categories
4. **Track** progress over time

For FIRE seekers, controlling lifestyle inflation is just as important as increasing income. This tool helps you stay on track by making the invisible visible.

---

**Remember**: The goal isn't to eliminate all spending increases. It's to make conscious, intentional choices about lifestyle changes while maintaining progress toward financial independence.
