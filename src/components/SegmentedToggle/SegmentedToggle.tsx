import { useMantineColorScheme, SegmentedControl, Group, Center, Box } from '@mantine/core';

export function SegmentedToggle() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <Group position="center" my="xl">
      <SegmentedControl
        value={colorScheme}
        onChange={(value: 'light' | 'dark') => toggleColorScheme(value)}
        data={[
          {
            value: 'light',
            label: (
              <Center>
                <Box>Açık</Box>
              </Center>
            ),
          },
          {
            value: 'dark',
            label: (
              <Center>
                <Box>Koyu</Box>
              </Center>
            ),
          },
        ]}
      />
    </Group>
  );
}
