import {
  Badge,
  Button,
  Center,
  Container,
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

const letterGrades = [
  { breakpoint: 100.0, name: 'AA' },
  { breakpoint: 100.0, name: 'BA' },
];

const rows = letterGrades.map((grade) => (
  <tr key={grade.name}>
    <td>{grade.name}</td>
    <td>≥{grade.breakpoint}</td>
  </tr>
));

export default function App() {
  const form = useForm({
    initialValues: {
      grades: '',
      passGrade: 35,
      passFinalGrade: 35,
    },
  });

  const submit = () => {
    if (form.isValid()) {
      alert('Test');
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
      <Center>
        <Container size={660} my={50}>
          <Title
            align="center"
            sx={(theme) => ({ fontFamily: `Greycliff CF, ${theme.fontFamily}`, fontWeight: 900 })}
          >
            Çan Hesaplama
          </Title>
          <SimpleGrid cols={2}>
            <Paper withBorder shadow="md" p={30} mt={30} radius="md">
              <form onSubmit={form.onSubmit((values) => console.log(values))}>
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
                  placeholder="Dersi geçebilmek için genel ortalamanın alabileceği en küçük değer"
                  label="Genel Geçme Notu"
                  hideControls
                  {...form.getInputProps('passGrade')}
                />
                <NumberInput
                  defaultValue={35}
                  placeholder="Dersi geçebilmek için final sınavından alınması gereken en düşük not"
                  label="Final Geçme Notu"
                  hideControls
                  {...form.getInputProps('passFinalGrade')}
                />
                <Button type="submit" fullWidth mt="xl" onClick={() => submit()}>
                  Hesapla
                </Button>
              </form>
            </Paper>
            <Paper withBorder shadow="md" p={30} mt={30} radius="md">
              <Tabs defaultValue="letterGrades">
                <Tabs.List>
                  <Tabs.Tab value="letterGrades">Harf Notları</Tabs.Tab>
                  <Tabs.Tab value="statistics">İstatistikler</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="letterGrades" pt="xs">
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
                  <Badge>Sınıf ortalaması</Badge> <Text>58</Text>
                  <Badge color="orange">Standart sapma</Badge> <Text>58</Text>
                  <Badge color="green">Başarılı öğrenci sayısı</Badge> <Text>58</Text>
                  <Badge color="red">Başarısız öğrenci sayısı</Badge> <Text>58</Text>
                </Tabs.Panel>
              </Tabs>
            </Paper>
          </SimpleGrid>
        </Container>
      </Center>
    </MantineProvider>
  );
}
