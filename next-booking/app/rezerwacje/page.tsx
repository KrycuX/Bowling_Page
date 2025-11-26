"use client";

import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";

const bookingLinks = [
  {
    href: "/kregle",
    title: "Kregle",
    description: "Rezerwacja jednego lub kilku torow na wybrana godzine (1-3 godziny)."
  },
  {
    href: "/bilard",
    title: "Bilard",
    description: "Stoly bilardowe rezerwowane na godzinowe sloty. Wybierz ile stolow potrzebujesz."
  },
  {
    href: "/quiz",
    title: "Quiz Room",
    description: "Pokoj quizowy na 60 minut. Cena zalezy od liczby uczestnikow (do 8 osob)."
  },
  {
    href: "/karaoke",
    title: "Karaoke Room",
    description: "Kameralny pokoj karaoke na 1-4 godziny, maksymalnie 10 uczestnikow."
  }
];

export default function ReservationPage() {
  return (
    <Container component="main" maxWidth="md" sx={{ py: 6 }}>
      <Stack spacing={4}>
        <div>
          <Typography variant="overline" color="primary">
            System rezerwacji
          </Typography>
          <Typography variant="h3" component="h2">
            Wybierz rodzaj atrakcji
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Stworzylismy dedykowane formularze dla kazdego typu rezerwacji. Wybierz interesujaca cie
            opcje, sprawdz dostepne terminy i zarezerwuj dogodny slot.
          </Typography>
        </div>

        <Stack spacing={3}>
          {bookingLinks.map((link) => (
            <Stack
              key={link.href}
              spacing={1}
              sx={{
                p: 3,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                backgroundColor: "background.paper"
              }}
            >
              <Typography variant="h5">{link.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {link.description}
              </Typography>
              <Button component={Link} href={link.href} variant="contained" sx={{ alignSelf: "flex-start", mt: 1 }}>
                Przejdz do formularza
              </Button>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Container>
  );
}
