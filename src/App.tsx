import {
  Badge,
  Button,
  ColorScheme,
  ColorSchemeProvider,
  Container,
  List,
  MantineProvider,
  NumberInput,
  Paper,
  SimpleGrid,
  Table,
  Tabs,
  Text,
  Textarea,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useLocalStorage } from '@mantine/hooks';
import { SegmentedToggle } from './components/SegmentedToggle/SegmentedToggle';
import { Footer } from './components/Footer/Footer';

// Lookup table for T-score thresholds when number of succeed students greater than or equal to 30
// X: Average grade
const lookupTable: { [letterGrade: string]: number }[] = [
  { FF: NaN, FD: 26, DD: 27, DC: 32, CC: 37, CB: 42, BB: 47, BA: 52, AA: 57 }, // 80,00 ≤ X
  { FF: NaN, FD: 28, DD: 29, DC: 34, CC: 39, CB: 44, BB: 49, BA: 54, AA: 59 }, // 70,00 ≤ X
  { FF: NaN, FD: 30, DD: 31, DC: 36, CC: 41, CB: 46, BB: 51, BA: 56, AA: 61 }, // 62,50 ≤ X
  { FF: NaN, FD: 32, DD: 33, DC: 38, CC: 43, CB: 48, BB: 53, BA: 58, AA: 63 }, // 57,50 ≤ X
  { FF: NaN, FD: 34, DD: 35, DC: 40, CC: 45, CB: 50, BB: 55, BA: 60, AA: 65 }, // 52,50 ≤ X
  { FF: NaN, FD: 36, DD: 37, DC: 42, CC: 47, CB: 52, BB: 57, BA: 62, AA: 67 }, // 47,50 ≤ X
  { FF: NaN, FD: 38, DD: 39, DC: 44, CC: 49, CB: 54, BB: 59, BA: 64, AA: 69 }, // 42,50 ≤ X
  { FF: NaN, FD: 40, DD: 41, DC: 46, CC: 51, CB: 56, BB: 61, BA: 66, AA: 71 }, // X < 42,50
];

let gradeBreakpoints = [
  { breakpoint: 100.0, name: 'AA' },
  { breakpoint: 100.0, name: 'BA' },
  { breakpoint: 100.0, name: 'BB' },
  { breakpoint: 100.0, name: 'CB' },
  { breakpoint: 100.0, name: 'CC' },
  { breakpoint: 100.0, name: 'DC' },
  { breakpoint: 100.0, name: 'DD' },
  { breakpoint: 100.0, name: 'FD' },
  { breakpoint: 100.0, name: 'FF' },
];

const statistics = { average: 0.0, stdDev: 0.0, passed: 0.0, failed: 0.0 };

let rows = gradeBreakpoints.map((grade) => (
  <tr key={grade.name}>
    <td>{grade.name}</td>
    <td>≥{grade.breakpoint}</td>
  </tr>
));

function stdDev(numbers: number[]) {
  let sum = 0;
  let squaredSum = 0;
  numbers.forEach((number) => {
    sum += number;
    squaredSum += Math.pow(number, 2);
  });
  let stdDev = Math.sqrt(numbers.length * squaredSum - Math.pow(sum, 2)) / numbers.length;
  return stdDev;
}

export default function App() {
  const form = useForm({
    initialValues: {
      grades: '',
      passGrade: 35,
      passFinalGrade: 35,
      resThreshold: 20, // Grades less than this value will not be used (RES: Relative Evaluation System)
    },
    validate: {
      grades: (value) =>
        value != '' && value.split('\n').length > 0 ? null : 'Girilen notlar geçersiz',
      passGrade: (value) => (value >= 0 && value <= 100 ? null : 'Geçersiz geçme notu'),
      passFinalGrade: (value) => (value >= 0 && value <= 100 ? null : 'Geçersiz final notu'),
    },
  });

  const submit = () => {
    if (form.isValid()) {
      statistics.average = 0.0;
      statistics.stdDev = 0.0;
      statistics.failed = 0;
      statistics.passed = 0;

      let gradesNotParsed = form.values.grades.split('\n');
      let parsedGrades: number[] = [];
      let gradesSum = 0;

      gradesNotParsed.forEach((grade) => {
        // Some languages uses comma for separating fraction part
        // We need to convert them to dot to use parseFloat
        grade = grade.replaceAll(',', '.');
        let parsedGrade = parseFloat(grade);
        if (!isNaN(+parsedGrade) && parsedGrade > 0 && parsedGrade <= 100) {
          if (parsedGrade >= form.values.resThreshold) {
            parsedGrades.push(parsedGrade);
            gradesSum += parsedGrade;
            if (parsedGrade < form.values.passGrade) {
              statistics.failed += 1;
            } else {
              statistics.passed += 1;
            }
          } else {
            statistics.failed += 1;
          }
        }
      });

      statistics.average = parseFloat((gradesSum / parsedGrades.length).toFixed(2));
      statistics.stdDev = parseFloat(stdDev(parsedGrades).toFixed(2));

      let lookupIx = NaN;
      if (statistics.average >= 80.0) {
        lookupIx = 0;
      } else if (statistics.average >= 70.0) {
        lookupIx = 1;
      } else if (statistics.average >= 62.5) {
        lookupIx = 2;
      } else if (statistics.average >= 57.5) {
        lookupIx = 3;
      } else if (statistics.average >= 52.5) {
        lookupIx = 4;
      } else if (statistics.average >= 47.5) {
        lookupIx = 5;
      } else if (statistics.average >= 42.5) {
        lookupIx = 6;
      } else {
        lookupIx = 7;
      }

      // T-score: 10*[(Grade-Average)/Std.Dev]+50
      // Grade: ([(T-50)/10]*Std.Dev)+Average
      gradeBreakpoints = [];

      for (let letterGrade in lookupTable[lookupIx]) {
        let grade = (lookupTable[lookupIx][letterGrade] - 50) / 10.0;
        grade *= statistics.stdDev;
        grade += statistics.average;
        grade = parseFloat(grade.toFixed(2));
        if (letterGrade == 'FF') {
          grade = 0.0;
        }
        gradeBreakpoints.unshift({ breakpoint: grade, name: letterGrade });
      }

      rows = gradeBreakpoints.map((grade) => (
        <tr key={grade.name}>
          <td>{grade.name}</td>
          <td>≥{grade.breakpoint}</td>
        </tr>
      ));

      console.log(parsedGrades);
    }
  };

  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: 'mantine-color-scheme',
    defaultValue: 'light',
    getInitialValueInEffect: true,
  });

  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

  return (
    <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
      <MantineProvider
        theme={{
          colorScheme,
          globalStyles: (theme) => ({
            body: {
              justifyContent: 'center',
            },
          }),
        }}
        withGlobalStyles
      >
        <Container size={860} my={50}>
          <Title
            variant="gradient"
            gradient={{ from: 'blue', to: 'cyan' }}
            align="center"
            sx={(theme) => ({ fontFamily: `Greycliff CF, ${theme.fontFamily}`, fontWeight: 900 })}
          >
            Bağıl Değerlendirme Not Hesaplama
          </Title>
          <SimpleGrid cols={2}>
            <Paper withBorder shadow="md" p={30} mt={30} radius="md">
              <form onSubmit={form.onSubmit((values) => submit())}>
                <Textarea
                  label="Notlar"
                  placeholder="90&#10;100&#10;70&#10;..."
                  autosize
                  minRows={2}
                  maxRows={4}
                  {...form.getInputProps('grades')}
                />
                <NumberInput
                  defaultValue={35}
                  min={0}
                  max={100}
                  placeholder="Varsayılan: 35"
                  label="Başarı notu alt limiti"
                  hideControls
                  {...form.getInputProps('passGrade')}
                />
                <NumberInput
                  defaultValue={35}
                  min={0}
                  max={100}
                  placeholder="Varsayılan: 35"
                  label="Yıl sonu sınavı alt limiti"
                  hideControls
                  {...form.getInputProps('passFinalGrade')}
                />

                <NumberInput
                  defaultValue={20}
                  min={0}
                  max={100}
                  placeholder="Varsayılan: 20"
                  label="Bağıl değerlendirmeye katma limiti"
                  hideControls
                  {...form.getInputProps('resThreshold')}
                />

                <Button type="submit" fullWidth mt="xl">
                  Hesapla
                </Button>
              </form>
            </Paper>
            <Paper withBorder shadow="md" p={30} mt={30} radius="md">
              <Tabs defaultValue="letterGrades">
                <Tabs.List>
                  <Tabs.Tab value="letterGrades">Harf Notları</Tabs.Tab>
                  <Tabs.Tab value="statistics">İstatistikler</Tabs.Tab>
                  <Tabs.Tab value="descriptions">Açıklamalar</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="letterGrades" pt="0">
                  <Table>
                    <thead>
                      <tr>
                        <th>Harf Notu</th>
                        <th>Minimum Not</th>
                      </tr>
                    </thead>
                    <tbody>{rows}</tbody>
                  </Table>
                </Tabs.Panel>

                <Tabs.Panel value="statistics" pt="xs">
                  <Badge>Sınıf ortalaması</Badge> <Text>{statistics.average}</Text>
                  <Badge color="orange">Standart sapma</Badge> <Text>{statistics.stdDev}</Text>
                  <Badge color="green">Başarılı öğrenci sayısı</Badge>{' '}
                  <Text>{statistics.passed}</Text>
                  <Badge color="red">Başarısız öğrenci sayısı</Badge>{' '}
                  <Text>{statistics.failed}</Text>
                </Tabs.Panel>

                <Tabs.Panel value="descriptions" pt="xs">
                  <Text fw={700}>Bağıl değerlendirmeye katma limiti (BDKL)</Text>
                  <Text>
                    İlgili birim kurulu tarafından belirlenen; istatistiksel değerlendirmeye
                    dâhil edilecek başarı notlarının 100 puan üzerinden alt sınırı.
                  </Text>
                  <Text fw={700}>Yarıyıl/yıl sonu sınavı alt limiti (YSSL)</Text>
                  <Text>
                    İlgili birim kurulu tarafından belirlenen; bir dersten veya uygulamadan
                    başarılı olmak için gerekli yarıyıl/yıl sonu sınavı notu alt sınır değeri.
                  </Text>
                  <Text fw={700}>Başarı notu alt limiti (BNAL)</Text>
                  <Text>
                    İlgili birim kurulu tarafından belirlenen; bir dersten veya uygulamadan
                    başarılı olmak için gerekli başarı notu alt sınır değeri.
                  </Text>
                </Tabs.Panel>
              </Tabs>
            </Paper>
          </SimpleGrid>
          <SegmentedToggle></SegmentedToggle>
          <Footer
            links={[
              { label: 'Açık Kaynak', link: 'https://github.com/ahmethakanbesel/can-hesaplama' },
            ]}
          ></Footer>
        </Container>
      </MantineProvider>
    </ColorSchemeProvider>
  );
}
