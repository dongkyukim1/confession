/**
 * Component Showcase Screen
 *
 * Visual reference for all UI components
 * Use this to test and preview components
 */
import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {
  Button,
  Card,
  Input,
  Tag,
  EmptyState,
  LoadingSpinner,
  useToast,
} from '../components/ui';
import {
  TagSelector,
  ReactionPicker,
  DailyPromptCard,
  StatisticsCard,
} from '../components/features';
import {useTheme} from '../theme';
import {spacing, typography, borderRadius} from '../theme/tokens';
import {UserStatistics} from '../types/features';

export default function ComponentShowcase() {
  const {colors, isDark, setThemeMode} = useTheme();
  const {showToast} = useToast();

  // State for interactive components
  const [inputValue, setInputValue] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock statistics data
  const mockStats: UserStatistics = {
    totalEntries: 42,
    currentStreak: 7,
    longestStreak: 14,
    totalWords: 8520,
    averageWordsPerEntry: 203,
    mostUsedTags: [
      {tag: '행복', count: 15},
      {tag: '일', count: 12},
      {tag: '감사', count: 10},
    ],
    moodDistribution: {
      happy: 20,
      sad: 10,
      excited: 12,
    },
    entriesByDayOfWeek: [3, 8, 6, 7, 9, 5, 4],
    entriesByHour: new Array(24).fill(0).map((_, i) => (i >= 18 && i <= 22) ? Math.floor(Math.random() * 5) : Math.floor(Math.random() * 2)),
  };

  const handleButtonPress = (variant: string) => {
    showToast({
      message: `${variant} button pressed!`,
      type: 'success',
    });
  };

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: colors.neutral[50]}]}
      contentContainerStyle={styles.content}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, {color: colors.neutral[900]}]}>
          Component Showcase
        </Text>
        <Text style={[styles.headerSubtitle, {color: colors.neutral[600]}]}>
          Visual reference for all UI components
        </Text>
      </View>

      {/* Theme Toggle */}
      <Section title="Theme System" colors={colors}>
        <View style={styles.row}>
          <Button
            variant={!isDark ? 'primary' : 'secondary'}
            size="sm"
            onPress={() => setThemeMode('light')}>
            Light
          </Button>
          <Button
            variant={isDark ? 'primary' : 'secondary'}
            size="sm"
            onPress={() => setThemeMode('dark')}>
            Dark
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onPress={() => setThemeMode('auto')}>
            Auto
          </Button>
        </View>
      </Section>

      {/* Buttons */}
      <Section title="Buttons" colors={colors}>
        <View style={styles.column}>
          <Text style={[styles.sectionLabel, {color: colors.neutral[700]}]}>
            Variants
          </Text>
          <Button variant="primary" onPress={() => handleButtonPress('Primary')}>
            Primary Button
          </Button>
          <Button variant="secondary" onPress={() => handleButtonPress('Secondary')}>
            Secondary Button
          </Button>
          <Button variant="ghost" onPress={() => handleButtonPress('Ghost')}>
            Ghost Button
          </Button>
          <Button variant="destructive" onPress={() => handleButtonPress('Destructive')}>
            Destructive Button
          </Button>

          <Text style={[styles.sectionLabel, {color: colors.neutral[700]}]}>
            Sizes
          </Text>
          <Button variant="primary" size="sm" onPress={() => {}}>
            Small Button
          </Button>
          <Button variant="primary" size="md" onPress={() => {}}>
            Medium Button
          </Button>
          <Button variant="primary" size="lg" onPress={() => {}}>
            Large Button
          </Button>

          <Text style={[styles.sectionLabel, {color: colors.neutral[700]}]}>
            States
          </Text>
          <Button variant="primary" disabled onPress={() => {}}>
            Disabled Button
          </Button>
          <Button
            variant="primary"
            loading={loading}
            onPress={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 2000);
            }}>
            Loading Button
          </Button>
        </View>
      </Section>

      {/* Cards */}
      <Section title="Cards" colors={colors}>
        <Card variant="elevated" padding="md">
          <Text style={[styles.cardText, {color: colors.neutral[900]}]}>
            Elevated Card
          </Text>
          <Text style={[styles.cardSubtext, {color: colors.neutral[600]}]}>
            With shadow elevation
          </Text>
        </Card>
        <Card variant="outlined" padding="md">
          <Text style={[styles.cardText, {color: colors.neutral[900]}]}>
            Outlined Card
          </Text>
          <Text style={[styles.cardSubtext, {color: colors.neutral[600]}]}>
            With border
          </Text>
        </Card>
        <Card variant="filled" padding="md">
          <Text style={[styles.cardText, {color: colors.neutral[900]}]}>
            Filled Card
          </Text>
          <Text style={[styles.cardSubtext, {color: colors.neutral[600]}]}>
            With background color
          </Text>
        </Card>
        <Card
          variant="elevated"
          padding="md"
          onPress={() => showToast({message: 'Card pressed!', type: 'info'})}>
          <Text style={[styles.cardText, {color: colors.neutral[900]}]}>
            Pressable Card
          </Text>
          <Text style={[styles.cardSubtext, {color: colors.neutral[600]}]}>
            Tap me!
          </Text>
        </Card>
      </Section>

      {/* Inputs */}
      <Section title="Inputs" colors={colors}>
        <Input
          label="Default Input"
          placeholder="Enter text..."
          value={inputValue}
          onChangeText={setInputValue}
        />
        <Input
          label="Input with Error"
          placeholder="Enter text..."
          error="This field is required"
          value=""
          onChangeText={() => {}}
        />
        <Input
          label="Success Input"
          placeholder="Enter text..."
          variant="success"
          hint="Looks good!"
          value="correct@email.com"
          onChangeText={() => {}}
        />
      </Section>

      {/* Tags */}
      <Section title="Tags" colors={colors}>
        <View style={styles.tagRow}>
          <Tag variant="default">Default</Tag>
          <Tag variant="primary">Primary</Tag>
          <Tag variant="success">Success</Tag>
          <Tag variant="warning">Warning</Tag>
          <Tag variant="error">Error</Tag>
        </View>
        <View style={styles.tagRow}>
          <Tag icon="😊">With Icon</Tag>
          <Tag selected>Selected</Tag>
          <Tag size="sm">Small</Tag>
          <Tag
            onPress={() =>
              showToast({message: 'Tag pressed!', type: 'info'})
            }>
            Pressable
          </Tag>
        </View>
      </Section>

      {/* Tag Selector */}
      <Section title="Tag Selector" colors={colors}>
        <TagSelector
          selectedTags={selectedTags}
          onTagsChange={setSelectedTags}
        />
        {selectedTags.length > 0 && (
          <Text style={[styles.note, {color: colors.neutral[600]}]}>
            Selected: {selectedTags.join(', ')}
          </Text>
        )}
      </Section>

      {/* Reactions */}
      <Section title="Reaction Picker" colors={colors}>
        <ReactionPicker
          onReaction={(id) =>
            showToast({message: `Reacted with ${id}`, type: 'success'})
          }
          currentReactions={{heart: 12, hug: 8, clap: 5}}
          userReaction="heart"
        />
      </Section>

      {/* Daily Prompt */}
      <Section title="Daily Prompt" colors={colors}>
        <DailyPromptCard
          onUsePrompt={(prompt) =>
            showToast({message: 'Prompt used!', type: 'success'})
          }
        />
      </Section>

      {/* Statistics */}
      <Section title="Statistics Card" colors={colors}>
        <StatisticsCard statistics={mockStats} />
      </Section>

      {/* Loading Spinner */}
      <Section title="Loading Spinner" colors={colors}>
        <View style={styles.row}>
          <LoadingSpinner size={30} />
          <LoadingSpinner size={40} />
          <LoadingSpinner size={60} />
        </View>
      </Section>

      {/* Empty State */}
      <Section title="Empty State" colors={colors}>
        <EmptyState
          icon="📭"
          title="No items found"
          description="Try adding some items to see them here"
          actionLabel="Add Item"
          onAction={() => showToast({message: 'Action pressed!', type: 'info'})}
        />
      </Section>

      {/* Toast Examples */}
      <Section title="Toast Notifications" colors={colors}>
        <View style={styles.column}>
          <Button
            variant="primary"
            size="sm"
            onPress={() =>
              showToast({message: 'Success message!', type: 'success'})
            }>
            Show Success Toast
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onPress={() =>
              showToast({message: 'Error message!', type: 'error'})
            }>
            Show Error Toast
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onPress={() =>
              showToast({message: 'Warning message!', type: 'warning'})
            }>
            Show Warning Toast
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onPress={() =>
              showToast({message: 'Info message!', type: 'info'})
            }>
            Show Info Toast
          </Button>
        </View>
      </Section>

      {/* Spacing Reference */}
      <Section title="Spacing Scale" colors={colors}>
        <View style={styles.spacingContainer}>
          {Object.entries(spacing).map(([key, value]) => (
            <View key={key} style={styles.spacingRow}>
              <Text style={[styles.spacingLabel, {color: colors.neutral[700]}]}>
                {key}
              </Text>
              <View
                style={[
                  styles.spacingBox,
                  {
                    width: value,
                    backgroundColor: colors.primary[500],
                  },
                ]}
              />
              <Text style={[styles.spacingValue, {color: colors.neutral[600]}]}>
                {value}px
              </Text>
            </View>
          ))}
        </View>
      </Section>

      {/* Color Palette */}
      <Section title="Color Palette" colors={colors}>
        <View style={styles.colorGrid}>
          <ColorSwatch label="Primary" color={colors.primary[500]} />
          <ColorSwatch label="Success" color={colors.success[500]} />
          <ColorSwatch label="Warning" color={colors.warning[500]} />
          <ColorSwatch label="Error" color={colors.error[500]} />
          <ColorSwatch label="Info" color={colors.info[500]} />
          <ColorSwatch label="Neutral" color={colors.neutral[500]} />
        </View>
      </Section>
    </ScrollView>
  );
}

// Helper Components
interface SectionProps {
  title: string;
  children: React.ReactNode;
  colors: any;
}

const Section = ({title, children, colors}: SectionProps) => (
  <View style={styles.section}>
    <Text style={[styles.sectionTitle, {color: colors.neutral[900]}]}>
      {title}
    </Text>
    {children}
  </View>
);

interface ColorSwatchProps {
  label: string;
  color: string;
}

const ColorSwatch = ({label, color}: ColorSwatchProps) => (
  <View style={styles.colorSwatch}>
    <View style={[styles.colorBox, {backgroundColor: color}]} />
    <Text style={styles.colorLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  headerTitle: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.sm,
  },
  headerSubtitle: {
    fontSize: typography.sizes.md,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  column: {
    gap: spacing.md,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  cardText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xs,
  },
  cardSubtext: {
    fontSize: typography.sizes.sm,
  },
  note: {
    fontSize: typography.sizes.sm,
    marginTop: spacing.sm,
  },
  spacingContainer: {
    gap: spacing.sm,
  },
  spacingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  spacingLabel: {
    width: 50,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  spacingBox: {
    height: 20,
    borderRadius: borderRadius.sm,
  },
  spacingValue: {
    fontSize: typography.sizes.sm,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  colorSwatch: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  colorBox: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
  },
  colorLabel: {
    fontSize: typography.sizes.sm,
  },
});
