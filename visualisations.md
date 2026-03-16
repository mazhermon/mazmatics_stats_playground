# Creative Data Visualisation Research

> Research notes from exploring Information is Beautiful, IiB Awards 2024/2025, The Pudding, DataViz Catalogue, and allied sources. Goal: build a broader set of creative visualisation options for Mazmatics Stats.

---

## 1. Key Principles from Information is Beautiful

David McCandless / IiB philosophy:
- **Beyond the bar chart** — default charts (bar, line, pie) are often the wrong choice
- **Information + aesthetics together** — beauty is not decoration; good design IS clarity
- **Metaphorical resonance** — use visual form that echoes the subject matter (e.g. birdsong arcs for sorrow, womb shape for birth data)
- **Break the 4th wall** — the best work invites users to personalise or explore
- **Proportionality is truth** — areas, widths, and sizes must be honestly proportional to data values
- Tool-agnostic: the creative decision comes before the technical one

---

## 2. Visualisation Taxonomy (60+ Types from DataViz Catalogue)

### 2.1 Comparison & Distribution
| Chart | Best For | Creative Potential |
|---|---|---|
| Bar / Multi-set Bar | Comparing categories | Lollipop variant, sorted, diverging |
| Box & Whisker | Distribution summary | Combine with strip/dot plot |
| Violin Plot | Full distribution shape | Beautiful paired violins |
| Histogram | Frequency bins | Overlay multiple with opacity |
| Dot Matrix | Discrete unit counts | Can become pictogram / waffle |
| Error Bars | Uncertainty ranges | Candlestick-style encoding |
| Beeswarm | All points, no overlap | Combines distribution + identity |
| Ridgeline / Joy Plot | Many groups over time | Elegant stacked density curves |

### 2.2 Composition & Part-to-Whole
| Chart | Best For | Creative Potential |
|---|---|---|
| Treemap | Hierarchical proportions | Colour + size double-encoding |
| Sunburst | Multi-level hierarchy | Radial treemap, drill-down |
| Circle Packing | Hierarchical clusters | Nested bubbles, animated entry |
| Waffle Chart | Simple proportions | 10×10 grid; each square = 1% |
| Voronoi | Part-to-whole, spatial | Irregular, organic beauty |
| Marimekko | Two categorical vars | Width × height = value |
| Unit / Pictogram | Humanising counts | 1 icon = N people/events |
| Proportional Area | Bubble comparison | Honest area scaling critical |

### 2.3 Trend & Time Series
| Chart | Best For | Creative Potential |
|---|---|---|
| Line / Area | Continuous time trend | Gradient fill, annotation |
| Stream Graph | Relative composition over time | Flowing, organic rhythm |
| Horizon Chart | Many series in compact space | Fold negatives up, colour bands |
| Spiral Plot | Cyclical patterns | Annual/weekly cycles on spiral |
| Gantt | Schedules, durations | Timeline storytelling |
| Bump Chart | Rank changes over time | Dramatic rank reversals |
| Slope Chart | Before/after comparison | Two-point ranking change |

### 2.4 Relationships & Connections
| Chart | Best For | Creative Potential |
|---|---|---|
| Chord Diagram | Circular flow between groups | Proportional arcs, beautiful layout |
| Sankey / Alluvial | Flow with volume | Energy/money/migration flows |
| Arc Diagram | Linear network | Ordering reveals structure |
| Network Diagram | Complex relationships | Force-directed, clustered |
| Heatmap / Matrix | Two-dimensional correlation | Colour gradient, sortable |
| Parallel Coordinates | Multi-variable comparison | Brushing to filter |
| Hierarchical Edge Bundling | Complex tree + network | Reduces hairball clutter |
| Connected Scatter | Sequence in scatterplot | Narrative path through data |

### 2.5 Geographic & Spatial
| Chart | Best For | Creative Potential |
|---|---|---|
| Choropleth | Regional values | Diverging colour scale |
| Bubble Map | Point values on map | Size + colour double-encoding |
| Hexbin Map | Removes size bias | Uniform geography |
| Cartogram | Value-distorted geography | Countries sized by data |
| Flow / Connection Map | Movement between places | Curved great-circle arcs |
| Dot Density Map | Population/event density | Individual points accumulate |

### 2.6 Statistical & Analytical
| Chart | Best For | Creative Potential |
|---|---|---|
| Scatterplot | Two-variable correlation | Quadrant annotation, colour groups |
| 2D Density / Hexbin | Overplotting solution | Heat gradient in scatter space |
| Correlogram | Multi-variable matrix | Upper/lower triangle patterns |
| Radar / Spider | Multi-dimension profile | Team/product comparison |
| Nightingale Rose | Cyclic multivariate | Beautiful angular segments |
| Population Pyramid | Age/gender distribution | Diverging horizontal bars |
| Bullet Graph | KPI vs target | Compact, information-dense |

### 2.7 Storytelling & Interactive Forms
| Form | How It Works | Creative Potential |
|---|---|---|
| Scrollytelling | Scroll triggers chart state changes | Narrative + data in lockstep |
| Stepper / Sticky | Chart pinned; text scrolls | The Pudding signature style |
| Interactive Flowchart | Decision tree walkthrough | Climate predicament award winner |
| Animated Transition | State changes animate smoothly | D3 transitions, morphing |
| Filterable / Brushable | User controls what they see | Personalises the data story |
| Small Multiples | Same chart, many subgroups | 255 charts as one argument |
| Drill-down | Click to zoom into detail | Treemap / sunburst pattern |

---

## 3. Award-Winning Techniques (IiB Awards 2024)

### Gold Winners by Category — Key Techniques

**"Is the Love Song Dying?"** (Arts & Culture Gold)
- Technique: Interactive filtering, personalisation, "breaks the 4th wall"
- Lesson: Let users bring their own context to the data

**"Birdsong of Sorrow above Ukraine"** (Current Affairs Gold)
- Technique: Metaphorical visual language (nature imagery encoding conflict impact)
- Lesson: Subject matter can dictate visual form; metaphor deepens emotional connection

**"Swiss Mountains"** (Leisure/Sports Gold)
- Technique: Cartographic + elevation, visually stunning topographic
- Lesson: Data that already has inherent beauty — let it breathe

**"Zoonotic Web"** (Science/Tech Gold)
- Technique: Network diagram showing disease transmission between species
- Lesson: Network viz reveals hidden systemic relationships; "perfectly crafted"

**"I Want a Better Catastrophe"** (Environment Gold)
- Technique: Interactive decision-tree / flowchart
- Lesson: Non-linear navigation can match the complexity of the subject

**"World in Tangible Fragments"** (Unusual Gold)
- Technique: Physical / non-digital data representation
- Lesson: Medium is part of the message; data can exist beyond screens

**"Material Interactions: Data-Driven Community Quilting"** (Unusual Silver)
- Technique: Textile/craft-based data viz
- Lesson: Community participation can be a data encoding mechanism

### Outstanding Studio: The Pudding
- Consistently innovative; educational livestreams mentoring community
- Flag grid, dot-density seas, walls of names — making scale tangible
- Signature: stepper/sticky layout, scroll-driven state changes

---

## 4. Design Principles Distilled

### Visual Encoding Hierarchy (most → least accurate perception)
1. Position on common scale (bar, scatter, line)
2. Position on non-aligned scale
3. Length / direction / angle
4. Area
5. Volume / curvature
6. Colour hue / saturation

**Implication:** Use area/volume only when you ALSO have labels or interaction. Reserve colour for categorical distinction or divergence — not for magnitude.

### Aesthetic Strategies That Work
- **Dark backgrounds** — dramatically increase visual contrast; work especially well for geographic and network data
- **Gradient fills on areas** — add depth without adding data
- **Metaphorical form** — visual shape echoes subject (womb=birth, web=contagion)
- **Proportional sizing** — honest area scaling (radius² = value, NOT radius = value)
- **Controlled animation** — easing in/out, stagger, spring physics create delight
- **Typography as data** — word clouds, font-size encoding
- **White space as signal** — negative space makes the data breathe

### Common Pitfalls to Avoid
- **Pie charts with >4 slices** — use bar, waffle, or treemap instead
- **Spider/radar charts** — cognitively hard; use parallel coordinates or grouped bars
- **Dual y-axes** — almost always misleading; facet instead
- **3D bar charts** — occlusion destroys accuracy; use 2D
- **Unscaled bubbles** — if radius = value, area deceives; scale by area
- **Spaghetti line charts** — >5 lines → use small multiples or highlight + grey

---

## 5. Specific Techniques Relevant to NZQA / Mazmatics Stats

### Currently in Use
- Choropleth map (regional NZ data)
- Line/area charts (timeline data)
- Bar charts (group comparisons)
- 3D bar chart (R3F)

### High-Value Additions to Explore

**Beeswarm** — Show individual school/regional data points without overlap; distributions emerge naturally. Great for "where does Auckland sit relative to all regions?"

**Ridgeline / Joy Plot** — Stack year-on-year achievement distributions by ethnicity or region. Shows when curves shift, widen, or converge.

**Waffle / Unit Chart** — Humanise student counts. "Of every 100 Māori students who sat NCEA Level 2, 68 achieved." Immediate and visceral.

**Alluvial / Sankey** — Show flow of students from one attainment band to another across years. Track cohort movement.

**Bump Chart** — Region ranking changes over time. Which regions moved up or down in achievement rank over 10 years?

**Horizon Chart** — Compact time series showing many regions simultaneously; folds negatives up.

**Chord Diagram** — Inter-group relationships (e.g. overlap between attainment cohorts across ethnicities at regional level). Visually striking.

**Slope Chart** — Before/after: 2014 vs 2024 achievement by group. Two vertical axes, lines connecting each group's value.

**Small Multiples** — Same chart repeated per region, ethnicity, or year. Enforces consistent scale for fair comparison.

**Scrollytelling** — Walk the user through a data story: "How did Māori achievement change from 2014 to 2024?" with scroll-triggered annotations and transitions.

**Proportional Circle / Bubble Comparison** — NZ regions as proportionally-sized circles; area = student population, colour = achievement rate.

**Cartogram** — Distort NZ map so each region's area is proportional to student count, not geography.

---

## 6. Sources & References

- [Information is Beautiful — Visualizations](https://informationisbeautiful.net/visualizations/)
- [IiB Awards 2024 Winners](https://www.informationisbeautifulawards.com/news/680-announcing-the-2024-winners)
- [Data Visualisation Catalogue](https://datavizcatalogue.com)
- [From Data to Viz](https://www.data-to-viz.com/)
- [The Pudding](https://pudding.cool/)
- [NYT Best DataViz — IiB Awards News](https://www.informationisbeautifulawards.com/news/118-the-nyt-s-best-data-visualizations-of-the-yea)
- [Visme — Best DataViz 2026](https://visme.co/blog/best-data-visualizations/)
- [Flourish — Scrollytelling](https://flourish.studio/blog/no-code-scrollytelling/)
- [Data Viz Society — IiB Awards](https://www.datavisualizationsociety.org/iib-awards)
