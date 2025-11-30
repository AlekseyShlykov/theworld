# 🎨 Customization Guide - Guns, Germs & Steel

This guide explains how to customize every aspect of the game without touching the code.

## 📁 File Structure Overview

All customization is done through JSON files in the `public/data/` folder:

```
public/data/
├── logic.json        # Game mechanics & variables
├── en.json          # English text content
├── ru.json          # Russian text content  
└── turnLogic.json   # Turn-by-turn balance
```

---

## 🎯 1. Changing Variables & Game Mechanics

Edit `public/data/logic.json` to modify:

### Area Properties
```json
{
  "areas": [
    {
      "id": "A1",                    // Area identifier (don't change)
      "start": {"x": 0.23, "y": 0.61}, // Position (0.0 to 1.0)
      "power": 1.0,                  // Starting power level
      "acc": 1.0,                    // Starting acceleration/growth
      "color": "#FF6B6B"             // Area color (hex)
    }
  ]
}
```

**Examples:**
- **Change starting positions**: Modify `x` and `y` values (0.0 = left/top, 1.0 = right/bottom)
- **Adjust difficulty**: Change `power` and `acc` starting values
- **Add more areas**: Copy an existing area and change `id` (A6, A7, etc.)

### Barrier Thresholds
```json
{
  "barrierThresholds": {
    "river": 1.0,      // Required acc to cross rivers
    "mountain": 3.0,   // Required acc to cross mountains  
    "ocean": 7.0       // Required acc to cross oceans
  }
}
```

**Examples:**
- **Easier barriers**: Lower the numbers (river: 0.5, mountain: 2.0, ocean: 5.0)
- **Harder barriers**: Raise the numbers (river: 2.0, mountain: 5.0, ocean: 10.0)

### Animation & Growth Settings
```json
{
  "turns": 8,                    // Number of game turns
  "overlayAnimationMaxMs": 3000, // Animation duration (milliseconds)
  "baseGrowthRadius": 50,        // Base area size in pixels
  "growthMultiplier": 1.5        // Growth rate multiplier
}
```

**Examples:**
- **Faster animations**: Change `overlayAnimationMaxMs` to 1500
- **Slower growth**: Change `growthMultiplier` to 1.2
- **More turns**: Change `turns` to 10

### Power Ranking Opacity
```json
{
  "opacityByRank": {
    "1": 0.8,   // Most powerful area opacity
    "2": 0.75,  // Second most powerful
    "3": 0.7,   // Third most powerful
    "4": 0.65,  // Fourth most powerful
    "5": 0.6    // Least powerful area
  }
}
```

**Examples:**
- **More contrast**: Use 1.0, 0.8, 0.6, 0.4, 0.2
- **Less contrast**: Use 0.9, 0.85, 0.8, 0.75, 0.7

---

## 🌈 2. Changing Area Colors

Edit `public/data/logic.json` → `areas` array:

### Current Colors
```json
{
  "areas": [
    {"id": "A1", "color": "#FF6B6B"}, // Red
    {"id": "A2", "color": "#4ECDC4"}, // Teal  
    {"id": "A3", "color": "#45B7D1"}, // Blue
    {"id": "A4", "color": "#FFA07A"}, // Orange
    {"id": "A5", "color": "#98D8C8"}  // Light Green
  ]
}
```

### Color Examples

**Earth Tones:**
```json
{"color": "#8B4513"}, // Saddle Brown
{"color": "#CD853F"}, // Peru
{"color": "#D2B48C"}, // Tan
{"color": "#DEB887"}, // Burlywood
{"color": "#F5DEB3"}  // Wheat
```

**Vibrant Colors:**
```json
{"color": "#FF1493"}, // Deep Pink
{"color": "#00CED1"}, // Dark Turquoise
{"color": "#9932CC"}, // Dark Orchid
{"color": "#FFD700"}, // Gold
{"color": "#DC143C"}  // Crimson
```

**Pastel Colors:**
```json
{"color": "#FFB6C1"}, // Light Pink
{"color": "#87CEEB"}, // Sky Blue
{"color": "#DDA0DD"}, // Plum
{"color": "#F0E68C"}, // Khaki
{"color": "#98FB98"}  // Pale Green
```

### Color Tools
- **Hex Color Picker**: https://htmlcolorcodes.com/
- **Color Palettes**: https://coolors.co/
- **Accessibility Check**: https://webaim.org/resources/contrastchecker/

---

## 📝 3. Changing Text Content

Edit `public/data/en.json` for English or `public/data/ru.json` for Russian:

### UI Labels & Buttons
```json
{
  "ui": {
    "title": "Guns, Germs & Steel",
    "subtitle": "An Interactive Journey Through Human History",
    "buttons": {
      "music": "Music",
      "tts": "Voice", 
      "sfx": "SFX",
      "site": "Website",
      "twitter": "Twitter",
      "email": "Contact"
    },
    "areaLabels": {
      "A1": "Region 1: Fertile Crescent",
      "A2": "Region 2: East Asia",
      "A3": "Region 3: Mesoamerica", 
      "A4": "Region 4: Sub-Saharan Africa",
      "A5": "Region 5: New Guinea"
    }
  }
}
```

**Examples:**
- **Change game title**: Modify `"title"`
- **Rename regions**: Edit `"areaLabels"` values
- **Add new buttons**: Add entries to `"buttons"` object

### Step Content
```json
{
  "steps": [
    {
      "id": 1,
      "icon": "stone.png",
      "title": "Settlement & Where to Live",
      "phase1Text": "Around 13,000 years ago...",
      "choiceQuestion": "Which region will develop most this turn?",
      "phase3": {
        "image": "step1.jpg",
        "video": null,
        "text": "The Fertile Crescent became..."
      }
    }
  ]
}
```

**Examples:**
- **Change step titles**: Modify `"title"`
- **Edit narration**: Change `"phase1Text"`
- **Update questions**: Modify `"choiceQuestion"`
- **Rewrite history**: Edit `"phase3.text"`

### Toast Messages
```json
{
  "ui": {
    "toast": {
      "advanced": "advanced this turn",
      "powerGain": "Power",
      "accGain": "Growth"
    }
  }
}
```

**Examples:**
```json
{
  "toast": {
    "advanced": "gained advantages",
    "powerGain": "Influence", 
    "accGain": "Expansion"
  }
}
```

### Final Screen
```json
{
  "ui": {
    "finalScreen": {
      "title": "Journey Complete",
      "subtitle": "The story of human civilization...",
      "restart": "Play Again"
    }
  }
}
```

---

## 🎮 4. Changing Turn Balance & Choices

Edit `public/data/turnLogic.json` to modify game balance:

### Turn Structure
```json
{
  "turn1": {
    "onChoose": {
      "A1": {"powerDelta": 0.5, "accDelta": 0.3},
      "A2": {"powerDelta": 0.4, "accDelta": 0.2},
      "A3": {"powerDelta": 0.3, "accDelta": 0.2},
      "A4": {"powerDelta": 0.2, "accDelta": 0.1},
      "A5": {"powerDelta": 0.2, "accDelta": 0.1}
    }
  }
}
```

### Balance Examples

**Balanced Game:**
```json
{
  "turn1": {
    "onChoose": {
      "A1": {"powerDelta": 0.3, "accDelta": 0.2},
      "A2": {"powerDelta": 0.3, "accDelta": 0.2},
      "A3": {"powerDelta": 0.3, "accDelta": 0.2},
      "A4": {"powerDelta": 0.3, "accDelta": 0.2},
      "A5": {"powerDelta": 0.3, "accDelta": 0.2}
    }
  }
}
```

**Imbalanced Game (A1 favored):**
```json
{
  "turn1": {
    "onChoose": {
      "A1": {"powerDelta": 1.0, "accDelta": 0.8},
      "A2": {"powerDelta": 0.2, "accDelta": 0.1},
      "A3": {"powerDelta": 0.2, "accDelta": 0.1},
      "A4": {"powerDelta": 0.2, "accDelta": 0.1},
      "A5": {"powerDelta": 0.2, "accDelta": 0.1}
    }
  }
}
```

**Progressive Difficulty:**
```json
{
  "turn1": {"onChoose": {"A1": {"powerDelta": 0.1, "accDelta": 0.1}}},
  "turn2": {"onChoose": {"A1": {"powerDelta": 0.2, "accDelta": 0.2}}},
  "turn3": {"onChoose": {"A1": {"powerDelta": 0.3, "accDelta": 0.3}}},
  "turn8": {"onChoose": {"A1": {"powerDelta": 1.0, "accDelta": 1.0}}}
}
```

---

## 🌍 5. Adding New Languages

### Step 1: Create Language File
Copy `public/data/en.json` to `public/data/[language].json`:

```bash
cp public/data/en.json public/data/es.json  # Spanish
cp public/data/en.json public/data/fr.json  # French
cp public/data/en.json public/data/de.json  # German
```

### Step 2: Translate Content
Edit the new file and translate all text fields:

```json
{
  "ui": {
    "title": "Armas, Gérmenes y Acero",  // Spanish
    "subtitle": "Un viaje interactivo...",
    "areaLabels": {
      "A1": "Región 1: Creciente Fértil",
      "A2": "Región 2: Asia Oriental"
    }
  },
  "steps": [
    {
      "title": "Asentamiento y Dónde Vivir",
      "phase1Text": "Hace unos 13.000 años...",
      "choiceQuestion": "¿Qué región se desarrollará más este turno?"
    }
  ]
}
```

### Step 3: Add Language Button
Edit `src/App.tsx` and add the new language option:

```tsx
<div className="language-selector">
  <button className={language === 'en' ? 'active' : ''} onClick={() => setLanguage('en')}>
    EN
  </button>
  <button className={language === 'es' ? 'active' : ''} onClick={() => setLanguage('es')}>
    ES
  </button>
  <button className={language === 'ru' ? 'active' : ''} onClick={() => setLanguage('ru')}>
    RU
  </button>
</div>
```

---

## 🎨 6. Advanced Customization

### Custom Step Icons
1. Create new icon files (64x64px PNG or SVG)
2. Place in `public/assets/`
3. Update `en.json` step definitions:

```json
{
  "steps": [
    {
      "id": 1,
      "icon": "my-custom-icon.png",
      "title": "My Custom Step"
    }
  ]
}
```

### Custom Map Images
1. Create `map-image.png` (800x600px) - decorative background
2. Create `land-mask.png` (800x600px) - black/white mask
3. Place in `public/assets/`
4. White = land (areas can expand), Black = ocean/barriers

### Custom Media Files
Add images/videos to `public/assets/` and reference in steps:

```json
{
  "phase3": {
    "image": "my-historical-image.jpg",
    "video": "my-historical-video.mp4",
    "text": "Custom historical explanation..."
  }
}
```

---

## 🔧 7. Testing Changes

### Quick Test Process
1. **Edit JSON files** in `public/data/`
2. **Save the file**
3. **Refresh browser** (F5)
4. **Test the changes**

### Common Issues & Solutions

**Problem: Changes not appearing**
- Solution: Hard refresh (Ctrl+F5 or Cmd+Shift+R)
- Check browser console for JSON syntax errors

**Problem: Game won't load**
- Solution: Validate JSON at https://jsonlint.com/
- Check for missing commas, brackets, quotes

**Problem: Areas not showing**
- Solution: Verify `logic.json` has 5 areas with valid coordinates
- Check that area IDs are A1, A2, A3, A4, A5

**Problem: Text not updating**
- Solution: Ensure you're editing the correct language file
- Check that language selector matches your edits

---

## 📋 8. Quick Reference

### File Locations
- **Game mechanics**: `public/data/logic.json`
- **English text**: `public/data/en.json`  
- **Russian text**: `public/data/ru.json`
- **Turn balance**: `public/data/turnLogic.json`
- **Assets**: `public/assets/`

### Key Variables
- **Area positions**: `logic.json` → `areas[].start`
- **Area colors**: `logic.json` → `areas[].color`
- **Growth rates**: `logic.json` → `baseGrowthRadius`, `growthMultiplier`
- **Barrier difficulty**: `logic.json` → `barrierThresholds`
- **Turn rewards**: `turnLogic.json` → `turn[].onChoose`

### Text Elements
- **Game title**: `[language].json` → `ui.title`
- **Area names**: `[language].json` → `ui.areaLabels`
- **Step titles**: `[language].json` → `steps[].title`
- **Narration**: `[language].json` → `steps[].phase1Text`
- **Questions**: `[language].json` → `steps[].choiceQuestion`
- **History**: `[language].json` → `steps[].phase3.text`

---

## 🎯 9. Example Customizations

### Fantasy Theme
```json
// logic.json
{
  "areas": [
    {"id": "A1", "color": "#8B0000"}, // Dark Red (Fire Kingdom)
    {"id": "A2", "color": "#006400"}, // Dark Green (Forest Realm)
    {"id": "A3", "color": "#4169E1"}, // Royal Blue (Sky Empire)
    {"id": "A4", "color": "#800080"}, // Purple (Shadow Lands)
    {"id": "A5", "color": "#FFD700"}  // Gold (Mountain Kingdom)
  ]
}

// en.json
{
  "ui": {
    "title": "Realms of Power",
    "areaLabels": {
      "A1": "Fire Kingdom",
      "A2": "Forest Realm", 
      "A3": "Sky Empire",
      "A4": "Shadow Lands",
      "A5": "Mountain Kingdom"
    }
  },
  "steps": [
    {
      "title": "The Great Awakening",
      "phase1Text": "In the ancient times, five kingdoms emerged...",
      "choiceQuestion": "Which kingdom will rise to power this era?"
    }
  ]
}
```

### Space Theme
```json
// logic.json
{
  "areas": [
    {"id": "A1", "color": "#FF4500"}, // Orange Red (Mars Colony)
    {"id": "A2", "color": "#00BFFF"}, // Deep Sky Blue (Europa Station)
    {"id": "A3", "color": "#9370DB"}, // Medium Purple (Titan Base)
    {"id": "A4", "color": "#32CD32"}, // Lime Green (Ganymede Outpost)
    {"id": "A5", "color": "#FF69B4"}  // Hot Pink (Io Research Station)
  ]
}

// en.json
{
  "ui": {
    "title": "Colonies & Conquest",
    "areaLabels": {
      "A1": "Mars Colony",
      "A2": "Europa Station",
      "A3": "Titan Base", 
      "A4": "Ganymede Outpost",
      "A5": "Io Research Station"
    }
  }
}
```

---

## 🚀 10. Deployment Tips

### After Making Changes
1. **Test thoroughly** in development
2. **Validate all JSON** files
3. **Check all languages** if multilingual
4. **Test on mobile** devices
5. **Build for production**: `npm run build`

### Backup Strategy
```bash
# Backup original files
cp public/data/en.json public/data/en.json.backup
cp public/data/logic.json public/data/logic.json.backup

# Restore if needed
cp public/data/en.json.backup public/data/en.json
```

---

## 💡 Pro Tips

1. **Start small**: Make one change at a time
2. **Test frequently**: Refresh browser after each change
3. **Use JSON validators**: Check syntax before testing
4. **Keep backups**: Save original files
5. **Document changes**: Keep notes of what you modified
6. **Color accessibility**: Ensure good contrast ratios
7. **Mobile testing**: Check touch interactions work
8. **Performance**: Large images/videos may slow loading

---

## 🆘 Troubleshooting

### Common JSON Errors
```json
// ❌ Missing comma
{"A1": "value" "A2": "value"}

// ✅ Correct
{"A1": "value", "A2": "value"}

// ❌ Missing quote
{"A1": value}

// ✅ Correct  
{"A1": "value"}

// ❌ Trailing comma
{"A1": "value",}

// ✅ Correct
{"A1": "value"}
```

### Debug Steps
1. **Check browser console** (F12 → Console)
2. **Validate JSON** at jsonlint.com
3. **Compare with working files**
4. **Test in incognito mode**
5. **Clear browser cache**

---

**Happy customizing! 🎨✨**

Remember: All changes are in JSON files - no coding required!
