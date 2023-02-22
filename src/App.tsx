import {
  Badge,
  Button,
  Center,
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
  Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';

const letterGrades = [
  { breakpoint: 100.0, name: 'AA' },
  { breakpoint: 100.0, name: 'BA' },
];

const statistics = {average: '0.00', stdDev: '0.00', passed: 0.0, failed: 0.0}

const rows = letterGrades.map((grade) => (
  <tr key={grade.name}>
    <td>{grade.name}</td>
    <td>≥{grade.breakpoint}</td>
  </tr>
));

function stdDev(numbers: number[]) {
  let sum = 0
  let squaredSum = 0
  numbers.forEach(number => {
    sum += number
    squaredSum += Math.pow(number, 2)
  })
  let stdDev = Math.sqrt((numbers.length * squaredSum) - Math.pow(sum, 2)) / numbers.length
  return stdDev
}

export default function App() {
  const form = useForm({
    initialValues: {
      grades: '',
      passGrade: 35,
      passFinalGrade: 35,
      resThreshold: 20 // Grades less than this value will not be used (RES: Relative Evaluation System)
    },
    validate: {
      grades: (value) => (value != '' && (value.split('\n').length > 0) ? null : 'Girilen notlar geçersiz'),
      passGrade: (value) => ((value >= 0) && (value <= 100) ? null : 'Geçersiz geçme notu'),
      passFinalGrade: (value) => ((value >= 0) && (value <= 100) ? null : 'Geçersiz final notu'),
    },
  });

  const submit = () => {
    if (form.isValid()) {
      let gradesNotParsed = form.values.grades.split('\n')
      let parsedGrades: number[] = []
      let gradesSum = 0
      
      gradesNotParsed.forEach(grade => {
        // Some languages uses comma for separating fraction part
        // We need to convert them to dot to use parseFloat
        grade = grade.replaceAll(',', '.')
        let parsedGrade = parseFloat(grade)
        if (!isNaN(+parsedGrade) && parsedGrade > 0 && parsedGrade <= 100 && parsedGrade >= form.values.resThreshold) {
          parsedGrades.push(parsedGrade)
          gradesSum += parsedGrade
        }
      })

      statistics.average = (gradesSum / parsedGrades.length).toFixed(2)
      statistics.stdDev = stdDev(parsedGrades).toFixed(2)
      
      console.log(parsedGrades)
    }
  };

  return (
    <MantineProvider
      theme={{
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
            align="center"
            sx={(theme) => ({ fontFamily: `Greycliff CF, ${theme.fontFamily}`, fontWeight: 900 })}
          >
            Çan Hesaplama
          </Title>
          <SimpleGrid cols={2}>
            <Paper withBorder shadow="md" p={30} mt={30} radius="md">
              <form onSubmit={form.onSubmit((values) => (submit()))}>
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
                  <Badge color="green">Başarılı öğrenci sayısı</Badge> <Text>{statistics.passed}</Text>
                  <Badge color="red">Başarısız öğrenci sayısı</Badge> <Text>{statistics.failed}</Text>
              </Tabs.Panel>
              
              <Tabs.Panel value="descriptions" pt="xs">
                 <List>
      <List.Item><Text fw={700}>Bağıl değerlendirmeye katma limiti (BDKL)</Text> <Text>İlgili birim kurulu tarafından belirlenen; istatistiksel değerlendirmeye dâhil edilecek başarı notlarının 100 puan üzerinden alt sınır.</Text></List.Item>
      <List.Item><Text fw={700}>Yarıyıl/yıl sonu sınavı alt limiti (YSSL)</Text> <Text>İlgili birim kurulu tarafından belirlenen; bir dersten veya uygulamadan başarılı olmak için gerekli yarıyıl/yıl sonu sınavı notu alt sınır değeri.</Text></List.Item>
      <List.Item><Text fw={700}>Başarı notu alt limiti (BNAL)</Text> <Text>İlgili birim kurulu tarafından belirlenen; bir dersten veya uygulamadan başarılı olmak için gerekli başarı notu alt sınır değeri.</Text></List.Item>
    </List>
</Tabs.Panel>
              </Tabs>
            </Paper>
          </SimpleGrid>
        </Container>
    </MantineProvider>
  );
}
