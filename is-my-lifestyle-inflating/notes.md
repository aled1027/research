# Development Notes - Lifestyle Inflation Tracker

## Project Goal
Create a tool to detect and measure lifestyle inflation for FIRE-focused individuals.

## Initial Research - Lifestyle Inflation Metrics

### What is Lifestyle Inflation?
Lifestyle inflation (or lifestyle creep) occurs when discretionary spending increases as income rises, potentially derailing long-term financial goals like FIRE.

### Key Challenges
1. Inflation adjustment - need to separate real lifestyle changes from monetary inflation
2. Life stage changes - some increases are appropriate (e.g., family growth, health needs)
3. Non-linear patterns - inflation can be sporadic or category-specific
4. Identifying discretionary vs. necessary spending

### Research Findings

#### Key Metrics from FIRE Community

1. **Savings Rate** (Primary Indicator)
   - Formula: (Savings / Income) × 100
   - Most direct measure of lifestyle inflation
   - FIRE target: 50%+ typically
   - If savings rate decreases while income increases = lifestyle inflation

2. **Personal Inflation Rate**
   - Year-over-year spending increase rate
   - Compare to CPI (Consumer Price Index)
   - Bad if consistently above CPI inflation
   - Adjusted for real lifestyle changes vs monetary inflation

3. **Discretionary Spending Ratio**
   - Discretionary / Total Spending
   - Tracks "wants" vs "needs"
   - Essential: housing, transport, groceries, insurance
   - Discretionary: dining out, entertainment, subscriptions, travel

4. **Category-Specific Trend Analysis**
   - Track individual spending categories over time
   - Identify specific areas of inflation
   - Helps distinguish appropriate increases from creep

5. **FI Ratio** (Context metric)
   - Net Worth / (Annual Expenses × 25)
   - Shows progress to financial independence
   - 100% = financially independent (4% rule)

#### Key Insights

- Lifestyle inflation is often category-specific (e.g., dining, subscriptions)
- Former luxuries become "new necessities" (psychological shift)
- Savings rate is the canary in the coal mine
- Need to adjust for real inflation (CPI) to get meaningful trends
- Track monthly initially, then quarterly once stable

#### Design Decision

Will implement multiple metrics and let user choose primary focus:
- **Quick Check**: Savings rate trend
- **Deep Dive**: Multi-metric dashboard
- **Category Focus**: Spending breakdown by category

## Design Phase

### Tool Architecture

**Input Format**: JSON file with monthly financial data
- Date/period
- Income
- Savings
- Total spending
- Spending by category (with essential/discretionary flags)
- Optional: Net worth, CPI data

**Analysis Modes**:
1. **Savings Rate Analysis**: Track over time, identify trends
2. **Inflation Analysis**: Personal vs CPI, identify outliers
3. **Category Analysis**: Deep dive into spending categories
4. **Full Dashboard**: All metrics combined

**Output**: Terminal-friendly reports with:
- Key metrics and trends
- Visual indicators (ASCII charts or simple symbols)
- Actionable insights and warnings
- Time series comparisons

### Implementation Plan
1. Create Python script with data loading
2. Implement each metric calculator
3. Build analysis modes
4. Create sample data generator
5. Test with realistic scenarios

## Implementation Notes

### Files Created
1. **lifestyle_tracker.py** - Main analysis tool (~450 lines)
2. **example_data.json** - Sample data showing lifestyle inflation over 12 months

### Features Implemented

**Core Metrics**:
- Savings Rate: (Savings / Income) × 100
- Personal Inflation Rate: YoY spending growth
- Discretionary Spending Ratio: Discretionary / Total
- FI Ratio: Net Worth / (Annual Expenses × 25)
- Category-specific tracking

**Analysis Modes**:
1. **Savings** - Quick check of savings rate trends
2. **Inflation** - Personal vs CPI comparison
3. **Category** - Detailed category breakdown with hotspot detection
4. **Dashboard** - Complete overview with all metrics

### Testing Results

Tested with example data showing gradual lifestyle inflation:
- Income increased from $8k to $9.5k/month (+18.8%)
- Spending increased from $4k to $6.3k/month (+57.5%)
- Savings rate dropped from 50% to 33.7% (-16.3pp)

**Key Detections**:
✓ Identified declining savings rate trend
✓ Detected spending growth above CPI
✓ Pinpointed specific categories:
  - Entertainment: +98.3% growth
  - Dining out: +73.0% growth
  - Shopping: +66.1% growth
  - Subscriptions: +50.0% growth

All analysis modes working correctly and providing actionable insights.

## Final Implementation

### Files Completed
1. **lifestyle_tracker.py** - Main analysis tool with 4 analysis modes
2. **example_data.json** - Realistic example showing lifestyle inflation
3. **data_template.json** - Template for users to fill in their data
4. **README.md** - Comprehensive documentation with:
   - Problem explanation
   - Metric definitions
   - Usage instructions
   - Research findings
   - Best practices for FIRE context
   - Example outputs
5. **notes.md** - Development notes (this file)

### What Makes This Useful for FIRE

1. **Multiple perspectives**: Different analysis modes for different needs
2. **Context-aware**: Distinguishes essential vs discretionary spending
3. **Actionable insights**: Specific warnings and recommendations
4. **CPI comparison**: Separates lifestyle inflation from monetary inflation
5. **Category precision**: Identifies exactly where inflation is occurring
6. **No dependencies**: Pure Python, easy to run anywhere
7. **Flexible**: Works with whatever data format you can compile

### Key Design Decisions

- **Terminal-based output**: Quick to run, no GUI needed
- **JSON input**: Easy to create from spreadsheets or manual tracking
- **Multiple modes**: Choose depth of analysis needed
- **Clear warnings**: Visual indicators (⚠️, ✓, ✗) for quick scanning
- **FIRE-focused thresholds**: Built around 50% savings rate targets

### What I Learned

1. **Savings rate is king**: Most direct indicator of lifestyle inflation for FIRE
2. **Category tracking matters**: Inflation is rarely uniform across spending
3. **CPI context crucial**: Need to separate real lifestyle changes from inflation
4. **Discretionary creep**: The biggest risk areas are entertainment, dining, subscriptions
5. **Psychological aspect**: Former luxuries becoming "necessities" is the core challenge

### Potential Use Cases

- Monthly check-ins after payday
- Quarterly financial reviews
- Annual planning sessions
- Post-raise assessments
- Budget troubleshooting
- FIRE progress tracking
- Accountability with partners/communities

## Web Tool Development

### Design Goals
1. **No server required**: Pure HTML/CSS/JavaScript - runs locally
2. **Visual analytics**: Interactive charts and graphs
3. **Easy data entry**: Forms + JSON upload
4. **Responsive design**: Works on desktop, tablet, mobile
5. **Local storage**: Save data in browser
6. **Export capability**: Download results and data

### Web Architecture
- **Frontend**: HTML5, CSS3, vanilla JavaScript
- **Charts**: Chart.js for visualizations
- **Storage**: LocalStorage API for persistence
- **Layout**: Single-page application with tabs/sections
- **Data**: JSON format (same as CLI tool)

### Features to Implement
1. Data input form (add monthly entries)
2. JSON file upload/download
3. Dashboard with key metrics
4. Interactive charts (savings rate, spending trends, category breakdown)
5. Multiple analysis views (same as CLI modes)
6. Warnings and insights display
7. Data management (edit, delete entries)
8. Export reports

## Web Tool Implementation Complete

### File Created
**index.html** (~57KB) - Complete single-page web application

### Features Implemented

**User Interface**:
- Responsive design with gradient header
- Tab-based navigation (Dashboard, Savings, Inflation, Categories, Data, About)
- Modern card-based layout
- Color-coded metrics (green/yellow/red for status)
- Mobile-friendly responsive design

**Data Management**:
- Add entries via interactive form
- Import JSON files (compatible with CLI tool format)
- Export data as JSON
- Load example data with one click
- Delete individual entries
- LocalStorage persistence (data saved in browser)
- Data table view with all entries

**Analytics & Visualizations** (using Chart.js):
1. **Dashboard Tab**:
   - Key metrics cards (Savings Rate, Spending, Discretionary %, FI Ratio)
   - Alerts for concerning trends
   - Savings rate trend line chart
   - Spending vs Income multi-line chart

2. **Savings Rate Tab**:
   - Average, max, min savings rates
   - Trend analysis with insights
   - Bar chart showing monthly rates with color coding
   - Detailed table with status indicators

3. **Inflation Tab**:
   - Personal vs CPI inflation comparison
   - Metric cards showing averages and differences
   - Line chart comparing personal inflation to CPI
   - Insights on spending growth

4. **Categories Tab**:
   - Essential vs discretionary breakdown
   - Doughnut chart of spending by category
   - Horizontal bar chart of growth rates
   - Hotspot detection for problem categories

5. **About Tab**:
   - Explanation of metrics
   - Usage instructions
   - Privacy notice

**Technical Details**:
- Pure HTML/CSS/JavaScript (no server required)
- Chart.js 4.4.0 for visualizations
- LocalStorage API for data persistence
- Runs completely offline after initial load
- No backend dependencies
- Compatible with example_data.json from CLI tool

**Advantages over CLI Tool**:
- Visual charts and graphs
- Interactive and intuitive
- No Python installation needed
- Works on any device with a browser
- Easier data entry with forms
- Real-time updates
- More engaging user experience
- Better for regular monitoring

## GitHub Pages Deployment

### Setup Steps
Created infrastructure for GitHub Pages deployment:

1. **Landing Page**: Created `/index.html` at repository root
   - Serves as project portfolio landing page
   - Links to lifestyle tracker and other projects
   - Responsive design matching tool aesthetic
   - Direct link to `is-my-lifestyle-inflating/index.html`

2. **File Structure**:
   ```
   /index.html                              (landing page)
   /is-my-lifestyle-inflating/
       ├── index.html                       (main tool)
       ├── example_data.json                (sample data)
       ├── lifestyle_tracker.py             (CLI version)
       └── README.md                        (documentation)
   ```

3. **To Enable GitHub Pages** (manual steps for repository owner):
   - Go to repository Settings on GitHub
   - Navigate to "Pages" section
   - Under "Source", select the branch to deploy from
   - Select "/ (root)" as the folder
   - Click Save
   - GitHub will provide the URL: `https://[username].github.io/research/`

4. **URLs After Deployment**:
   - Landing page: `https://[username].github.io/research/`
   - Lifestyle tracker: `https://[username].github.io/research/is-my-lifestyle-inflating/`

5. **Benefits**:
   - No server setup required
   - Automatic deployment on push
   - Free hosting via GitHub Pages
   - Custom domain support (optional)
   - HTTPS by default

### Technical Notes
- All tools are static (HTML/CSS/JS)
- No build process needed
- Works with LocalStorage (data stays in browser)
- Can be accessed from any device
- Easy to share with others via URL
