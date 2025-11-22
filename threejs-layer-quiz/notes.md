# Development Notes - Three.js Layering Quiz

## Project Goal
Create an interactive quiz to test understanding of Three.js depth testing, transparency, render order, and blending modes. Users see settings and must predict the visual outcome before seeing the actual render.

## Development Log

### Quiz Structure
- 20 multiple choice questions
- Each question shows material settings for 2-3 planes
- User must predict what they'll see
- After answering, show correct answer and render actual result
- Track score throughout quiz

### Question Categories

#### Depth Testing Questions (Q1-4)
- Testing understanding of depthTest on/off
- How depth testing affects overlapping objects
- When objects render regardless of depth

#### Depth Write Questions (Q5-8)
- Understanding depthWrite with transparent objects
- Common mistake: depthWrite=true on transparent materials
- Correct vs incorrect transparency settings

#### Render Order Questions (Q9-12)
- How renderOrder overrides spatial ordering
- Front-to-back vs back-to-front rendering
- Interaction with depth settings

#### Blending Modes Questions (Q13-16)
- Normal vs Additive blending visual outcomes
- Multiply and Subtractive effects
- Blending with different opacity values

#### Combined Concepts Questions (Q17-20)
- Complex scenarios combining multiple settings
- Edge cases and tricky configurations
- Material type differences

### Learning Objectives
By completing the quiz, users should understand:
1. When to use depthTest=true vs false
2. Why depthWrite should be false for transparent objects
3. How renderOrder controls drawing sequence
4. Visual effects of different blending modes
5. How these settings interact with each other
