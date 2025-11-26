"use client";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import LogoutIcon from "@mui/icons-material/Logout";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { logout } from "../../lib/panel/auth";
import { useAdminAuth } from "../../hooks/panel/useAdminAuth";
import { clearPanelSession } from "../../lib/panel/session";

const reservationsMenu = [
  { href: "/panel/rezerwacje", label: "Lista rezerwacji" },
  { href: "/panel/rezerwacje/nowa", label: "Nowa rezerwacja" },
];

const marketingMenu = [
  { href: "/panel/kupony", label: "Kupony" },
  { href: "/panel/zgody-marketingowe", label: "Zgody marketingowe" },
  { href: "/panel/kontakt", label: "Kontakt" },
];

const configMenu = [
  { href: "/panel/ustawienia", label: "Ustawienia" },
  { href: "/panel/godziny-otwarcia", label: "Godziny otwarcia" },
  { href: "/panel/dni-wolne", label: "Dni wolne" },
  { href: "/panel/galeria", label: "Galeria" },
  { href: "/panel/uzytkownicy", label: "Użytkownicy" },
];

export function PanelShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useAdminAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  
  // Menu anchors
  const [reservationsAnchor, setReservationsAnchor] = useState<null | HTMLElement>(null);
  const [marketingAnchor, setMarketingAnchor] = useState<null | HTMLElement>(null);
  const [configAnchor, setConfigAnchor] = useState<null | HTMLElement>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/panel/login");
    }
  }, [isLoading, user, router]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      clearPanelSession();
      router.replace("/panel/login");
      setLoggingOut(false);
    }
  };

  const handleReservationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setReservationsAnchor(event.currentTarget);
  };

  const handleReservationsClose = () => {
    setReservationsAnchor(null);
  };

  const handleMarketingOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMarketingAnchor(event.currentTarget);
  };

  const handleMarketingClose = () => {
    setMarketingAnchor(null);
  };

  const handleConfigOpen = (event: React.MouseEvent<HTMLElement>) => {
    setConfigAnchor(event.currentTarget);
  };

  const handleConfigClose = () => {
    setConfigAnchor(null);
  };

  const isMenuActive = (menuItems: { href: string }[]) => {
    return menuItems.some(item => pathname === item.href || pathname?.startsWith(item.href + "/"));
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <Typography>Ladowanie panelu...</Typography>
      </Box>
    );
  }

  if (!user) {
    return null;
  }

  const isAdmin = user.role === "ADMIN";

  return (
    <Box>
      <AppBar position="static" color="primary" elevation={2}>
        <Toolbar sx={{ minHeight: 64 }}>
          <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            🏢 Panel rezerwacji
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            {/* Dashboard - zawsze widoczny */}
            <Button
              component={Link}
              href="/panel"
              variant={pathname === "/panel" ? "contained" : "text"}
              color={pathname === "/panel" ? "secondary" : "inherit"}
              sx={{ 
                mr: 1,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: pathname === "/panel" ? 'bold' : 'normal',
                '&:hover': {
                  backgroundColor: pathname === "/panel" ? 'secondary.dark' : 'rgba(255,255,255,0.1)'
                }
              }}
            >
              Dashboard
            </Button>

            {/* Rezerwacje - menu rozwijane */}
            <Button
              onClick={handleReservationsOpen}
              variant={isMenuActive(reservationsMenu) ? "contained" : "text"}
              color={isMenuActive(reservationsMenu) ? "secondary" : "inherit"}
              endIcon={<KeyboardArrowDownIcon />}
              sx={{ 
                mr: 1,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: isMenuActive(reservationsMenu) ? 'bold' : 'normal',
                '&:hover': {
                  backgroundColor: isMenuActive(reservationsMenu) ? 'secondary.dark' : 'rgba(255,255,255,0.1)'
                }
              }}
            >
              Rezerwacje
            </Button>
            <Menu
              anchorEl={reservationsAnchor}
              open={Boolean(reservationsAnchor)}
              onClose={handleReservationsClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            >
              {reservationsMenu.map((item) => (
                <MenuItem
                  key={item.href}
                  onClick={() => {
                    handleReservationsClose();
                    router.push(item.href as Parameters<typeof router.push>[0]);
                  }}
                  selected={pathname === item.href}
                >
                  {item.label}
                </MenuItem>
              ))}
            </Menu>

            {/* Marketing - menu rozwijane */}
            <Button
              onClick={handleMarketingOpen}
              variant={isMenuActive(marketingMenu) ? "contained" : "text"}
              color={isMenuActive(marketingMenu) ? "secondary" : "inherit"}
              endIcon={<KeyboardArrowDownIcon />}
              sx={{ 
                mr: 1,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: isMenuActive(marketingMenu) ? 'bold' : 'normal',
                '&:hover': {
                  backgroundColor: isMenuActive(marketingMenu) ? 'secondary.dark' : 'rgba(255,255,255,0.1)'
                }
              }}
            >
              Marketing
            </Button>
            <Menu
              anchorEl={marketingAnchor}
              open={Boolean(marketingAnchor)}
              onClose={handleMarketingClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            >
              {marketingMenu.map((item) => (
                <MenuItem
                  key={item.href}
                  onClick={() => {
                    handleMarketingClose();
                    router.push(item.href as Parameters<typeof router.push>[0]);
                  }}
                  selected={pathname === item.href}
                >
                  {item.label}
                </MenuItem>
              ))}
            </Menu>

            {/* Konfiguracja - menu rozwijane (tylko dla admina) */}
            {isAdmin && (
              <>
                <Button
                  onClick={handleConfigOpen}
                  variant={isMenuActive(configMenu) ? "contained" : "text"}
                  color={isMenuActive(configMenu) ? "secondary" : "inherit"}
                  endIcon={<KeyboardArrowDownIcon />}
                  sx={{ 
                    mr: 1,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: isMenuActive(configMenu) ? 'bold' : 'normal',
                    '&:hover': {
                      backgroundColor: isMenuActive(configMenu) ? 'secondary.dark' : 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  Konfiguracja
                </Button>
                <Menu
                  anchorEl={configAnchor}
                  open={Boolean(configAnchor)}
                  onClose={handleConfigClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                >
                  {configMenu.map((item) => (
                    <MenuItem
                      key={item.href}
                      onClick={() => {
                        handleConfigClose();
                        router.push(item.href as Parameters<typeof router.push>[0]);
                      }}
                      selected={pathname === item.href}
                    >
                      {item.label}
                    </MenuItem>
                  ))}
                </Menu>
              </>
            )}

            <IconButton 
              color="inherit" 
              onClick={handleLogout} 
              disabled={loggingOut}
              sx={{ 
                ml: 2,
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              <LogoutIcon />
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>
      <Container maxWidth={false} sx={{ py: 4, px: 3 }}>{children}</Container>
    </Box>
  );
}
