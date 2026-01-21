import React, { useEffect, useState } from 'react';
import {
  alpha,
  AppBar,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  IconButton,
  Link,
  Stack,
  Toolbar,
  Typography,
  useTheme
} from '@mui/material';
import {
  ArrowForward,
  CheckCircle,
  Groups,
  Psychology,
  Security,
  Speed,
  Star,
  TrendingUp,
  VideoCall
} from '@mui/icons-material';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  const headerLinks = [
    { label: 'Product', href: '#product' },
    { label: 'Features', href: '#features' },
    { label: 'Stories', href: '#stories' },
    { label: 'Pricing', href: '/premium', internal: true }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (target) => {
    const selector = target?.startsWith('#') ? target : `#${target}`;
    const el = selector ? document.querySelector(selector) : null;
    if (el) {
      const headerOffset = 90;
      const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const featureCards = [
    {
      icon: VideoCall,
      title: 'Real-time Rooms',
      description: 'WebRTC + Socket.io provide enterprise-grade voice/video with shared questions and timers.'
    },
    {
      icon: Psychology,
      title: 'Intelligent Matching',
      description: 'Match by domain, experience, and goals so every session feels relevant.'
    },
    {
      icon: TrendingUp,
      title: 'Performance Intelligence',
      description: 'Analytics track progress across domains, difficulties, and feedback categories.'
    },
    {
      icon: Security,
      title: 'Compliance Ready',
      description: 'End-to-end encryption, audit trails, and secure storage for artifacts and recordings.'
    },
    {
      icon: Speed,
      title: 'Instant Scheduling',
      description: 'Zero wait times thanks to global invitation routing and conflict prevention.'
    },
    {
      icon: Groups,
      title: 'Operations Console',
      description: 'Admin panel monitors premium funnel, question bank health, and reported sessions.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Software Engineer, Google',
      avatar: 'SC',
      quote: 'Interview quality is indistinguishable from on-site loops. Feedback depth gave me a real edge.'
    },
    {
      name: 'Michael Rodriguez',
      role: 'Full Stack Engineer',
      avatar: 'MR',
      quote: 'We adopted MockInterview across our bootcamp cohorts. The analytics dashboard is gold.'
    },
    {
      name: 'Emily Johnson',
      role: 'Frontend, Meta',
      avatar: 'EJ',
      quote: 'Premium matching + structured scoring made every session actionable. Landed Meta within 6 weeks.'
    }
  ];

  const stats = [
    { label: 'Practicing Engineers', value: '18,500+' },
    { label: 'Interviews Facilitated', value: '112,000+' },
    { label: 'Avg. Rating', value: '4.9/5' },
    { label: 'Premium Teams', value: '230+' }
  ];

  const differentiators = [
    'Global invitation handler prevents duplicate session conflicts.',
    'Premium ledger and Razorpay reconciliation baked into Payment History.',
    'Admin automation scripts keep environments production-ready.',
    'Performance surfaces highlight readiness by stack and role.'
  ];

  const partners = ['Google', 'Meta', 'Microsoft', 'Amazon', 'Atlassian'];

  const heroColor =
    theme.palette.mode === 'dark'
      ? alpha(theme.palette.primary.dark, 0.85)
      : theme.palette.primary.main;
  const navTextColor = isScrolled ? theme.palette.text.primary : '#fff';
  const outlineBorderColor = isScrolled ? alpha(theme.palette.text.primary, 0.25) : alpha('#fff', 0.6);
  const outlineHoverColor = isScrolled ? alpha(theme.palette.text.primary, 0.08) : alpha('#fff', 0.15);
  const filledBg = isScrolled ? theme.palette.primary.main : alpha('#fff', 0.18);
  const filledColor = '#fff';
  const appBarBg = isScrolled ? alpha(theme.palette.background.paper, 0.95) : 'transparent';
  const appBarBorder = isScrolled ? `1px solid ${alpha(theme.palette.divider, 0.3)}` : 'none';
  const appBarImage = isScrolled ? 'none' : 'none';

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        color="transparent"
        elevation={isScrolled ? 6 : 0}
        sx={{
          transition: 'all 0.3s ease',
          backdropFilter: isScrolled ? 'blur(12px)' : 'none',
          borderBottom: 'none',
          backgroundImage: 'none',
          bgcolor: isScrolled ? appBarBg : heroColor,
          color: navTextColor,
          width: isScrolled ? 'calc(100% - 32px)' : '100%',
          left: isScrolled ? 16 : 0,
          right: isScrolled ? 16 : 0,
          top: isScrolled ? 16 : 0,
          borderRadius: isScrolled ? 3 : 0,
          border: appBarBorder,
          boxShadow: isScrolled ? theme.shadows[10] : 'none'
        }}
      >
        <Toolbar sx={{ maxWidth: '1200px', mx: 'auto', width: '100%', py: 1, px: { xs: 1.5, md: 3 }, gap: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={() => navigate('/')}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                bgcolor: theme.palette.primary.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 700
              }}
            >
              MI
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              MockInterview
            </Typography>
          </Box>
          <Box
            sx={{
              flexGrow: 1,
              display: 'flex',
              justifyContent: 'center',
              gap: 1.5,
              flexWrap: 'wrap'
            }}
          >
            {headerLinks.map((link) => (
              <Button
                key={link.label}
                onClick={() => (link.internal ? navigate(link.href) : scrollToSection(link.href))}
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  color: navTextColor
                }}
              >
                {link.label}
              </Button>
            ))}
          </Box>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Button
              variant="outlined"
              onClick={() => navigate('/login')}
              sx={{
                textTransform: 'none',
                borderColor: outlineBorderColor,
                color: navTextColor,
                '&:hover': {
                  borderColor: outlineBorderColor,
                  bgcolor: outlineHoverColor
                }
              }}
            >
              Sign in
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate('/register')}
              sx={{
                textTransform: 'none',
                bgcolor: filledBg,
                color: filledColor,
                boxShadow: isScrolled ? theme.shadows[4] : 'none',
                '&:hover': {
                  bgcolor: isScrolled ? theme.palette.primary.dark : alpha('#fff', 0.25)
                }
              }}
            >
              Get started
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Hero */}
      <Box
        sx={{
          scrollMarginTop: 100,
          '&::before': { content: '" "', display: 'block', position: 'relative', top: -80 },
          position: 'relative',
          overflow: 'hidden',
          bgcolor: heroColor,
          backgroundImage: 'none',
          color: 'white',
          pt: { xs: 14, md: 16 },
          pb: { xs: 8, md: 12 }
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundColor: heroColor,
            opacity: 0.2
          }}
        />
        <Container id="product" maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={7}>
              <Stack spacing={2}>
                <Chip
                  label="Trusted by high-growth teams & bootcamps"
                  sx={{
                    alignSelf: 'flex-start',
                    bgcolor: alpha('#fff', 0.15),
                    color: 'white',
                    px: 1
                  }}
                />
                <Typography
                  variant="h2"
                  sx={{ fontWeight: 800, fontSize: { xs: '2.8rem', md: '3.8rem' }, lineHeight: 1.1 }}
                >
                  Peer-to-peer interviews for serious job hunters
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 300 }}>
                  Run structured mock interviews, capture coaching-grade feedback, and share progress reports with mentors
                  or hiring partners – all in one streamlined workspace.
                </Typography>
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mt={4}>
                <Button
                  size="large"
                  variant="contained"
                  onClick={() => navigate('/register')}
                  endIcon={<ArrowForward />}
                  sx={{
                    bgcolor: '#fff',
                    color: 'primary.main',
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    '&:hover': {
                      bgcolor: alpha('#fff', 0.9),
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Start your first interview
                </Button>
                <Button
                  size="large"
                  variant="outlined"
                  color="inherit"
                  onClick={() => navigate('/login')}
                  startIcon={<PlayCircleOutlineIcon />}
                  sx={{
                    borderColor: alpha('#fff', 0.7),
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    '&:hover': {
                      borderColor: '#fff',
                      bgcolor: alpha('#fff', 0.1)
                    }
                  }}
                >
                  Watch product tour
                </Button>
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} mt={6}>
                {stats.slice(0, 2).map((stat) => (
                  <Box key={stat.label}>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {stat.label}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Grid>
            <Grid item xs={12} md={5}>
              <Card
                sx={{
                  borderRadius: 4,
                  px: 3,
                  py: 4,
                  bgcolor: alpha('#fff', 0.1),
                  border: `1px solid ${alpha('#fff', 0.2)}`,
                  boxShadow: 'none',
                  backdropFilter: 'blur(12px)',
                  color: 'white'
                }}
              >
                <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                  LIVE SESSION SNAPSHOT
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, mt: 1, mb: 3 }}>
                  Frontend pairing interview
                </Typography>
                <Stack spacing={3}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Focus domain
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      React & System Design
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Difficulty
                    </Typography>
                    <Chip label="Senior" sx={{ bgcolor: alpha('#fff', 0.15), color: 'white' }} />
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Expected feedback
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      12 data points
                    </Typography>
                  </Stack>
                </Stack>
                <Divider sx={{ borderColor: alpha('#fff', 0.3), my: 3 }} />
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  Powered by Socket.io, secured via JWT, recorded in MongoDB Atlas.
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Partner strip */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems="center">
          {partners.map((partner) => (
            <Typography
              key={partner}
              variant="subtitle2"
              sx={{ textTransform: 'uppercase', letterSpacing: 2, color: 'text.secondary', fontWeight: 600 }}
            >
              {partner}
            </Typography>
          ))}
        </Stack>
      </Container>

      {/* Feature grid */}
      <Container id="features" maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Stack spacing={2} alignItems="center" textAlign="center" mb={6}>
          <Chip label="Product pillars" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }} />
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            Built for modern interview readiness teams
          </Typography>
          <Typography variant="body1" color="text.secondary" maxWidth={720}>
            Blend peer coaching, analytics, and premium controls to create a measurable interview practice motion for
            universities, bootcamps, and internal guilds.
          </Typography>
        </Stack>

        <Grid container spacing={4}>
          {featureCards.map((feature) => {
            const Icon = feature.icon;
            return (
              <Grid item xs={12} sm={6} md={4} key={feature.title}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    p: 3,
                    border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: theme.shadows[6],
                      borderColor: theme.palette.primary.main
                    }
                  }}
                >
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 3
                    }}
                  >
                    <Icon />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>

      {/* Differentiators */}
      <Box sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04), py: { xs: 8, md: 10 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="overline" sx={{ color: 'primary.main', letterSpacing: 2 }}>
                Why teams switch
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mt: 2, mb: 3 }}>
                Operational control without sacrificing user experience
              </Typography>
              <Stack spacing={2}>
                {differentiators.map((item) => (
                  <Stack direction="row" spacing={2} alignItems="flex-start" key={item}>
                    <CheckCircle color="primary" />
                    <Typography color="text.secondary">{item}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  borderRadius: 4,
                  p: 4,
                  boxShadow: theme.shadows[8],
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                }}
              >
                <Stack spacing={2}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Ops snapshot
                  </Typography>
                  <Divider />
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary">Premium conversions</Typography>
                    <Typography fontWeight={700}>31% ↑</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary">Avg. feedback depth</Typography>
                    <Typography fontWeight={700}>10.4 notes</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary">SLA breaches</Typography>
                    <Chip label="0 this month" color="success" size="small" />
                  </Stack>
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Metrics */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Grid container spacing={4}>
          {stats.map((stat) => (
            <Grid item xs={12} sm={6} md={3} key={stat.label}>
              <Card
                sx={{
                  textAlign: 'center',
                  borderRadius: 3,
                  py: 4,
                  border: `1px solid ${alpha(theme.palette.divider, 0.8)}`
                }}
              >
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  {stat.label}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Testimonials */}
      <Box id="stories" sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.05), py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Stack spacing={2} alignItems="center" mb={6}>
            <Chip
              label="Customer stories"
              sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.15), color: theme.palette.secondary.main }}
            />
            <Typography variant="h3" sx={{ fontWeight: 700, textAlign: 'center' }}>
              Practitioners rate us 4.9/5 for readiness impact
            </Typography>
          </Stack>

          <Grid container spacing={4}>
            {testimonials.map((testimonial) => (
              <Grid item xs={12} md={4} key={testimonial.name}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 4,
                    p: 3,
                    boxShadow: theme.shadows[4],
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                  }}
                >
                  <Stack direction="row" spacing={1} mb={2}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} sx={{ color: '#FFC107', fontSize: 18 }} />
                    ))}
                  </Stack>
                  <Typography variant="body1" sx={{ mb: 3, fontStyle: 'italic', color: 'text.secondary' }}>
                    “{testimonial.quote}”
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>{testimonial.avatar}</Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {testimonial.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {testimonial.role}
                      </Typography>
                    </Box>
                  </Stack>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA */}
      <Box sx={{ bgcolor: theme.palette.primary.main, color: 'white', py: { xs: 8, md: 10 }, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography variant="overline" sx={{ letterSpacing: 2, opacity: 0.8 }}>
            Ready when you are
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 800, my: 2 }}>
            Spin up your mock interview network in minutes
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, mb: 4 }}>
            Launch for free, invite your peers, and upgrade when you need premium analytics and monetization tooling.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
              endIcon={<ArrowForward />}
              sx={{
                bgcolor: '#fff',
                color: 'primary.main',
                fontWeight: 600,
                px: 5,
                py: 1.8,
                '&:hover': {
                  bgcolor: alpha('#fff', 0.9)
                }
              }}
            >
              Start for free
            </Button>
            <Button
              variant="outlined"
              size="large"
              color="inherit"
              onClick={() => navigate('/premium')}
              sx={{
                borderColor: alpha('#fff', 0.7),
                color: 'white',
                px: 5,
                py: 1.8,
                '&:hover': {
                  borderColor: '#fff'
                }
              }}
            >
              Explore premium
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    bgcolor: theme.palette.primary.main,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 700
                  }}
                >
                  MI
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  MockInterview
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                High-signal interview practice for engineering teams, bootcamps, and ambitious individuals.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Explore
              </Typography>
              <Stack spacing={1}>
                <Link component="button" variant="body2" onClick={() => scrollToSection('#product')}>
                  Product
                </Link>
                <Link component="button" variant="body2" onClick={() => scrollToSection('#features')}>
                  Features
                </Link>
                <Link component="button" variant="body2" onClick={() => navigate('/premium')}>
                  Pricing
                </Link>
                <Link component="button" variant="body2" onClick={() => navigate('/login')}>
                  Sign in
                </Link>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Connect with us
              </Typography>
              <Stack direction="row" spacing={1}>
                <IconButton color="primary" size="small">
                  <LinkedInIcon />
                </IconButton>
                <IconButton color="primary" size="small">
                  <GitHubIcon />
                </IconButton>
                <IconButton color="primary" size="small">
                  <TwitterIcon />
                </IconButton>
              </Stack>
            </Grid>
          </Grid>
          <Divider sx={{ my: 4 }} />
          <Typography variant="caption" color="text.secondary">
            © {new Date().getFullYear()} MockInterview. Built with ❤️ for ambitious engineers.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;