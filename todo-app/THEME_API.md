# 🎨 EINHEITLICHE THEME-API DOKUMENTATION

## ⚠️ AGENT COMMUNICATION RULES

**ALLE AGENTS MÜSSEN:**
1. Diese exakte Nomenklatur verwenden
2. NUR die hier definierten Theme-Eigenschaften referenzieren
3. Bei Änderungen ZUERST diese Dokumentation aktualisieren
4. Konsistente Naming-Conventions befolgen

## 📐 DEFINIERTE THEME-STRUKTUR

### 1. COLORS (theme.colors.*)
```typescript
theme.colors.accent          // Haupt-Akzentfarbe
theme.colors.accentWeak      // Schwache Akzentfarbe
theme.colors.background      // Haupt-Hintergrund
theme.colors.backgroundSecondary // Sekundärer Hintergrund
theme.colors.surface         // Card/Modal Hintergrund
theme.colors.surfaceSecondary // Sekundäre Oberfläche
theme.colors.border          // Standard Rahmenfarbe
theme.colors.textPrimary     // Haupt-Textfarbe
theme.colors.textSecondary   // Sekundäre Textfarbe
theme.colors.textMuted       // Gedämpfte Textfarbe
theme.colors.textInverse     // Inverse Textfarbe (weiß/schwarz)
theme.colors.success         // Erfolgsfarbe
theme.colors.error           // Fehlerfarbe
theme.colors.warning         // Warnungsfarbe
theme.colors.info            // Info-Farbe
```

### 2. TYPOGRAPHY (theme.typography.*)
```typescript
theme.typography.sizes.xs    // 12px
theme.typography.sizes.sm    // 14px
theme.typography.sizes.md    // 16px
theme.typography.sizes.lg    // 18px
theme.typography.sizes.xl    // 20px

theme.typography.weights.normal    // '400'
theme.typography.weights.medium    // '500'
theme.typography.weights.semibold  // '600'
theme.typography.weights.bold      // '700'
```

### 3. SPACING (theme.spacing.*)
```typescript
theme.spacing.xs   // 4px
theme.spacing.sm   // 8px
theme.spacing.md   // 16px
theme.spacing.lg   // 24px
theme.spacing.xl   // 32px
```

### 4. BORDER RADIUS (theme.borderRadius.*)
```typescript
theme.borderRadius.sm    // 8px
theme.borderRadius.md    // 12px
theme.borderRadius.lg    // 16px
theme.borderRadius.full  // 9999px
```

### 5. GLASSMORPHISM (theme.glassmorphism.*)
```typescript
theme.glassmorphism.card.backgroundColor
theme.glassmorphism.card.borderRadius
theme.glassmorphism.card.shadowColor
theme.glassmorphism.card.shadowOffset
theme.glassmorphism.card.shadowOpacity
theme.glassmorphism.card.shadowRadius
theme.glassmorphism.card.elevation
theme.glassmorphism.borderWidth
theme.glassmorphism.borderColor
```

## 🚫 VERBOTENE REFERENZEN

**NIEMALS VERWENDEN:**
- `spacing.*` ohne theme. prefix
- `typography.*` ohne theme. prefix
- `shadows.*` (nicht definiert!)
- `borderRadius.*` ohne theme. prefix
- `theme.glass.*` (falsche Nomenklatur)
- Externe Imports von spacing/typography

## ✅ KORREKTE VERWENDUNG

**Richtig:**
```typescript
const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
  },
  title: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  }
});
```

**Falsch:**
```typescript
const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,           // ❌ Missing theme prefix
    borderRadius: borderRadius.md, // ❌ Missing theme prefix
    ...shadows.lg,                 // ❌ Undefined property
  }
});
```

## 🤝 AGENT KOORDINATION

1. **Vor Theme-Änderungen:** Diese Datei konsultieren
2. **Bei neuen Eigenschaften:** Erst hier dokumentieren, dann implementieren
3. **Bei Inkonsistenzen:** Sofort diese Standards anwenden
4. **Kommunikation:** Immer diese Nomenklatur in Prompts verwenden