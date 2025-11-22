# Three.js Mastery Quiz

An interactive educational quiz application designed to help students learn Three.js concepts from beginner to advanced levels.

## Overview

This quiz contains 50 carefully crafted multiple-choice questions covering core Three.js skills, best practices, and common patterns. It's designed for classroom use and self-paced learning.

## Features

### 📚 Comprehensive Coverage
- **50 Questions** spanning beginner to advanced difficulty
- **Three Difficulty Levels**:
  - Beginner (15 questions): Setup, cameras, basic rendering
  - Intermediate (20 questions): Materials, lighting, optimization
  - Advanced (15 questions): Shaders, performance, advanced techniques

### 🎨 Interactive Learning
- **Educational Explanations**: Detailed feedback after each answer
- **Visual Demonstrations**: Three.js canvas showing relevant 3D examples
- **Progress Tracking**: Visual progress bar and local storage persistence
- **Mobile Responsive**: Works seamlessly on phones, tablets, and desktops

### 💾 Student-Friendly
- **Auto-Save Progress**: Never lose your place - answers saved automatically
- **Clear Progress**: Reset button to start fresh
- **Results Summary**: Detailed breakdown by difficulty level

## Usage

### For Teachers

1. **Deploy the Quiz**: Host `index.html` on your LMS or web server
2. **Share the Link**: Students can access it from any device
3. **Self-Paced Learning**: Students work through at their own pace
4. **Review Results**: Students see immediate feedback with explanations

### For Students

1. **Open the Quiz**: Navigate to the hosted URL or open `index.html` locally
2. **Answer Questions**: Select your answer and receive instant feedback
3. **Learn from Explanations**: Read the detailed explanation for each question
4. **Track Progress**: Your answers are saved automatically
5. **Review Results**: Complete all 50 questions to see your score

### Controls

- **Next/Previous Buttons**: Navigate between questions
- **Clear Progress Button**: Reset all answers and start over
- **Option Selection**: Click any option to submit your answer

## Technical Details

### Topics Covered

1. **Core Concepts**
   - Scene, Camera, Renderer setup
   - Coordinate systems and transformations
   - Animation loops and requestAnimationFrame

2. **Geometry & Materials**
   - Built-in geometries (Box, Sphere, etc.)
   - Material types and properties
   - Textures and mapping

3. **Lighting**
   - Light types (Ambient, Directional, Point, Spot)
   - Shadow configuration
   - Performance considerations

4. **Advanced Topics**
   - Custom shaders and uniforms
   - BufferGeometry and attributes
   - Instancing and LOD
   - Post-processing effects
   - Performance optimization

### Implementation

- **Single File**: Entire application in one HTML file for easy deployment
- **No Build Required**: Pure HTML/CSS/JavaScript
- **CDN Dependencies**: Three.js r128 from CDN
- **LocalStorage API**: Client-side progress persistence
- **Responsive Design**: Mobile-first CSS with modern layout techniques

### Browser Compatibility

- Modern browsers with WebGL support
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## File Structure

```
threejs-quiz/
├── index.html          # Main quiz application (standalone)
├── notes.md           # Development notes and implementation details
└── README.md          # This file
```

## Customization

### Adding Questions

Edit the `questions` array in the `<script>` section:

```javascript
{
    id: 51,
    difficulty: 'intermediate',
    question: 'Your question here?',
    options: [
        'Option A',
        'Option B',
        'Option C',
        'Option D'
    ],
    correct: 0, // Index of correct answer (0-3)
    explanation: 'Detailed explanation of the correct answer.',
    visualization: null // or 'cube', 'sphere', etc.
}
```

### Adding Visualizations

Create a new case in the `showVisualization()` function:

```javascript
case 'your-viz-name':
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshPhongMaterial({ color: 0x667eea });
    currentMesh = new THREE.Mesh(geometry, material);
    scene.add(currentMesh);
    // Add lights, etc.
    break;
```

### Styling

Modify the CSS in the `<style>` section to match your branding:
- Update colors in gradient backgrounds
- Change fonts in the `body` selector
- Adjust spacing and sizing as needed

## Educational Goals

This quiz is designed to help students:

1. **Understand Core Concepts**: Master the fundamental Three.js architecture
2. **Learn Best Practices**: Discover recommended patterns and techniques
3. **Recognize Common Patterns**: Identify solutions to frequent challenges
4. **Progress Systematically**: Build knowledge from basics to advanced topics
5. **Self-Assess**: Identify areas needing more study

## License

This educational resource is free to use and modify for teaching purposes.

## Credits

Created as an educational tool for Three.js instruction. Questions cover official Three.js documentation concepts and community best practices.

---

**For Support**: Open the quiz in a modern web browser. If you encounter issues, ensure JavaScript and WebGL are enabled.
