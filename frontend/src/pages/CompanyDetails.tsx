import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  Grid,
  Chip,
  IconButton,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import InfoIcon from '@mui/icons-material/Info';
import BuildIcon from '@mui/icons-material/Build';
import CodeIcon from '@mui/icons-material/Code';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WaterIcon from '@mui/icons-material/Water';
import FactoryIcon from '@mui/icons-material/Factory';
import BarChartIcon from '@mui/icons-material/BarChart';
import GroupIcon from '@mui/icons-material/Group';
import SummarizeIcon from '@mui/icons-material/Summarize';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';

const sidebarSections = [
  { id: 1, label: 'Basic Information', icon: <InfoIcon fontSize="small" /> },
  { id: 2, label: 'Core Product / Service Capabilities', icon: <BuildIcon fontSize="small" /> },
  { id: 3, label: 'Technical Differentiators', icon: <CodeIcon fontSize="small" /> },
  { id: 4, label: 'Current Sales Priority', icon: <TrendingUpIcon fontSize="small" /> },
  { id: 5, label: 'Blue Ocean Markets', icon: <WaterIcon fontSize="small" /> },
  { id: 6, label: 'Target Industries', icon: <FactoryIcon fontSize="small" /> },
  { id: 7, label: 'Competitive Analysis', icon: <BarChartIcon fontSize="small" /> },
  { id: 8, label: 'Notable Clients & References', icon: <GroupIcon fontSize="small" /> },
  { id: 9, label: 'Capability Summary', icon: <SummarizeIcon fontSize="small" /> },
  { id: 10, label: 'Search Parameters', icon: <SearchIcon fontSize="small" /> },
  { id: 11, label: 'ICP (Ideal Customer Profile)', icon: <PersonIcon fontSize="small" /> },
];

// ─── Section content components ───────────────────────────────────────────────

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <Box sx={{ mb: 1.5 }}>
    <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
    <Typography variant="body2" fontWeight={500}>{value}</Typography>
  </Box>
);

const SectionCard = ({ title, children }: { title?: string; children: React.ReactNode }) => (
  <Paper variant="outlined" sx={{ p: 2.5, mb: 2, borderRadius: 2 }}>
    {title && (
      <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {title}
      </Typography>
    )}
    {children}
  </Paper>
);

function Section1() {
  return (
    <>
      <Typography variant="h6" fontWeight={700} gutterBottom>Basic Information</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <SectionCard title="Company Overview">
            <InfoRow label="Company Name" value="EnerTech UPS Pvt Ltd" />
            <InfoRow label="Industry" value="Power Electronics, Renewable Energy & Energy Storage Systems" />
            <InfoRow label="Established" value="1989 (33+ years)" />
            <InfoRow label="Headquarters" value="S. No. 399/1-2, Plot No 5, Bhare P.O. Ghotawade, Near Pirangut Mulsi, Pune, Maharashtra 412115" />
            <InfoRow label="Annual Revenue" value="~₹22 Crores (FY2023)" />
          </SectionCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <SectionCard title="Contact & Online Presence">
            <InfoRow label="Website" value="https://enertechups.com" />
            <InfoRow label="Email" value="sales@enertechups.com" />
            <InfoRow label="LinkedIn" value="https://linkedin.com/company/enertech-ups-pvt-ltd" />
            <InfoRow label="Phone" value="+91-9370659050 | 9373336340 | 9175413731" />
            <InfoRow label="Key Decision Makers" value="Vijay Deshpande (Chairman), Shivji Chauhan (Marketing Head)" />
          </SectionCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <SectionCard title="Scale & Reach">
            <InfoRow label="Total Installations" value="35,000+" />
            <InfoRow label="Repeat Customer Base" value="~60% (~3,500 repeat customers)" />
            <InfoRow label="Service Locations" value="20+ nationwide" />
            <InfoRow label="Channel Partners" value="100+ dealers (pan-India)" />
          </SectionCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <SectionCard title="Certifications">
            {['ISO 9001:2015', 'ISO 14001', 'BIS', 'CE', 'MNRE-approved', 'DGQA/DRDO', 'NTPC/POWERGRID', 'RCF/ICF', 'ISRO/NPCIL'].map(c => (
              <Chip key={c} label={c} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
            ))}
          </SectionCard>
        </Grid>
      </Grid>
    </>
  );
}

function Section2() {
  const products = [
    { name: 'Static Frequency Converters (SFC)', range: '1 kVA – 300 kVA', tech: '32-bit DSP + IGBT', industries: 'Aviation, Railways, Marine, Defense' },
    { name: 'Industrial Battery Charger & Discharger', range: '24V–600V DC; 20A–1000A', tech: 'IGBT/SCR/Thyristor-based', industries: 'Power, Oil & Gas, Rail, Telecom' },
    { name: 'Online UPS Systems (HTXi)', range: '5 kVA – 600 kVA (parallel)', tech: '32-bit DSP, Bidirectional IGBT', industries: 'Manufacturing, Healthcare, IT, Defense' },
    { name: 'Hybrid Solar Inverters & PCUs', range: '5 kVA – 300 kVA', tech: 'MPPT, Patented battery-less mode', industries: 'Solar EPC, C&I, Rural Electrification' },
    { name: 'EnerCube BESS', range: 'Modular kW – multi-MWh', tech: 'Modular LFP + Intelligent BMS', industries: 'Utility-scale solar, Microgrid, Commercial' },
  ];
  return (
    <>
      <Typography variant="h6" fontWeight={700} gutterBottom>Core Product / Service Capabilities</Typography>
      <Grid container spacing={2}>
        {products.map(p => (
          <Grid item xs={12} md={6} key={p.name}>
            <SectionCard title={p.name}>
              <InfoRow label="Range / Capacity" value={p.range} />
              <InfoRow label="Technology" value={p.tech} />
              <InfoRow label="Industries Served" value={p.industries} />
            </SectionCard>
          </Grid>
        ))}
      </Grid>
    </>
  );
}

function Section3() {
  const items = [
    { title: 'Digital Engineering', desc: '32-bit DSP control processors, embedded firmware, patented inverter topology, in-house technology development.' },
    { title: 'Smart Power Management', desc: 'Patented battery-less hybrid mode, zero-break DG synchronization, solar priority charging, automatic multi-source management.' },
    { title: 'IoT & Connectivity', desc: 'Full suite of protocols (GSM, GPRS, RS-485, Modbus/TCP), cloud dashboards, and remote diagnostics.' },
    { title: 'Advanced Manufacturing', desc: '15,000+ sq.ft R&D lab, environmental and load simulation testing, automated QA/CAPA systems.' },
    { title: 'Versatile Enclosures', desc: 'IP-20 to IP-65 configurations including specialized rail-grade underslung designs.' },
    { title: 'High Efficiency', desc: 'Systems achieving up to 96% efficiency with very low harmonic distortion and input power factor of 0.99.' },
  ];
  return (
    <>
      <Typography variant="h6" fontWeight={700} gutterBottom>Technical Differentiators</Typography>
      <Grid container spacing={2}>
        {items.map(i => (
          <Grid item xs={12} md={6} key={i.title}>
            <SectionCard title={i.title}>
              <Typography variant="body2" color="text.secondary">{i.desc}</Typography>
            </SectionCard>
          </Grid>
        ))}
      </Grid>
    </>
  );
}

function Section4() {
  const priorities = [
    'Static Frequency Converters (SFC)',
    'Industrial Battery Chargers',
    'Solar Hybrid Inverters',
    'Industrial / Online UPS for production machinery',
  ];
  return (
    <>
      <Typography variant="h6" fontWeight={700} gutterBottom>Current Sales Priority</Typography>
      <SectionCard>
        {priorities.map((p, i) => (
          <Box key={p} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Chip label={`#${i + 1}`} size="small" color="primary" />
            <Typography variant="body2" fontWeight={500}>{p}</Typography>
          </Box>
        ))}
      </SectionCard>
    </>
  );
}

function Section5() {
  const markets = [
    { name: 'Static Frequency Converters (SFC)', advantage: '25+ years track record, high custom engineering, limited domestic competition.', target: 'Aviation (GPU), Marine, Imported Machinery users.' },
    { name: 'Solar Hybrid Inverters (Battery-less)', advantage: 'Patented technology, bidirectional conversion, zero changeover.', target: 'Solar EPCs, C&I Rooftops, Microgrid developers.' },
    { name: 'Industrial Battery Chargers (IP65/Rail)', advantage: 'Specialized IP65 and underslung designs, high redundancy.', target: 'Indian Railways, Metro, Oil & Gas, Substations.' },
  ];
  return (
    <>
      <Typography variant="h6" fontWeight={700} gutterBottom>Blue Ocean Markets</Typography>
      <Grid container spacing={2}>
        {markets.map(m => (
          <Grid item xs={12} key={m.name}>
            <SectionCard title={m.name}>
              <InfoRow label="Competitive Advantage" value={m.advantage} />
              <InfoRow label="Target Customers" value={m.target} />
            </SectionCard>
          </Grid>
        ))}
      </Grid>
    </>
  );
}

function Section6() {
  const industries = [
    'Data Centers & IT Infrastructure',
    'Manufacturing & Industrial Automation',
    'Renewable Energy & Solar EPC',
    'Railways & Metro Rail Transportation',
    'Oil & Gas (Refineries, Pipelines)',
    'Telecom & Infrastructure',
    'Defense & Military',
    'Hospitals & Critical Healthcare',
    'Aerospace (ISRO, NPCIL)',
    'Process Control Industries',
  ];
  return (
    <>
      <Typography variant="h6" fontWeight={700} gutterBottom>Target Industries</Typography>
      <SectionCard>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {industries.map(ind => (
            <Chip key={ind} label={ind} variant="outlined" color="primary" />
          ))}
        </Box>
      </SectionCard>
    </>
  );
}

function Section7() {
  const items = [
    { label: 'Unique Value Proposition', value: '100% indigenous patented technology with single-source accountability for power, software, and mechanical design.' },
    { label: 'Engineering Strength', value: 'DSIR-approved R&D lab with 33+ years of experience in power electronics and embedded systems.' },
    { label: 'Product Portfolio', value: 'Broad range from small UPS to multi-MWh BESS and specialized SFCs.' },
    { label: 'Reliability & Performance', value: 'IEC-tested with high MTBF; input power factor 0.99 and current distortion <4%.' },
    { label: 'Cost Advantage / ROI', value: 'High efficiency (>95%) and smart management reduces fuel (DG) and battery maintenance costs.' },
    { label: 'Service Network', value: '20+ nationwide service locations with responsive after-sales support.' },
    { label: 'Channel Partners', value: '100+ dealers and partners providing pan-India reach.' },
    { label: 'Customer Retention', value: '~60% of revenue from ~3,500 repeat customers.' },
    { label: 'Government Certifications', value: 'DGS&D registered, DGQA/DRDO approved, MNRE approved.' },
    { label: 'Service Programs', value: 'QR-code based troubleshooting, AMC programs, and on-site training engineers.' },
  ];
  return (
    <>
      <Typography variant="h6" fontWeight={700} gutterBottom>Competitive Analysis</Typography>
      <Grid container spacing={2}>
        {items.map(i => (
          <Grid item xs={12} md={6} key={i.label}>
            <SectionCard title={i.label}>
              <Typography variant="body2" color="text.secondary">{i.value}</Typography>
            </SectionCard>
          </Grid>
        ))}
      </Grid>
    </>
  );
}

function Section8() {
  const groups = [
    { category: 'Government / Defense', clients: ['ISRO', 'NPCIL', 'Indian Air Force', 'NTPC', 'IOCL', 'GAIL India', 'RVNL', 'DRDO'] },
    { category: 'Industrial Clients', clients: ['Arcelor Mittal Nippon Steel India', 'Larsen & Toubro', 'Indian Peroxide Ltd', 'Nitco Limited'] },
    { category: 'Enterprise / IT Clients', clients: ['Uneecops Technologies', 'Delta Equipment', 'Himank Energy Solutions'] },
    { category: 'International Clients', clients: ['Global Offshore & Marine (Singapore)', 'Super India (Mexico)', 'Exports to 10+ countries in MENA and Africa'] },
  ];
  return (
    <>
      <Typography variant="h6" fontWeight={700} gutterBottom>Notable Clients & References</Typography>
      <Grid container spacing={2}>
        {groups.map(g => (
          <Grid item xs={12} md={6} key={g.category}>
            <SectionCard title={g.category}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {g.clients.map(c => <Chip key={c} label={c} size="small" />)}
              </Box>
            </SectionCard>
          </Grid>
        ))}
      </Grid>
    </>
  );
}

function Section9() {
  const capabilities = [
    'Core Power Electronics Engineering (33+ years)',
    'Patented Solar Hybrid & Battery-less Technology',
    'Modular & Scalable Energy Storage (BESS)',
    'IoT-enabled Monitoring & Remote Diagnostics',
    'Specialized Custom Engineering (IP65, 400Hz SFC)',
    'Comprehensive Nationwide Service Network',
  ];
  const positioning = [
    'Industrial Automation & Manufacturing Zero-Downtime Power',
    'Data Center & IT Power Infrastructure',
    'Renewable Microgrids & Village Electrification',
    'Defense & Strategic Infrastructure Energy Projects',
  ];
  return (
    <>
      <Typography variant="h6" fontWeight={700} gutterBottom>Capability Summary</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <SectionCard title="Core Capabilities">
            {capabilities.map(c => (
              <Box key={c} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main', mt: 0.8, flexShrink: 0 }} />
                <Typography variant="body2">{c}</Typography>
              </Box>
            ))}
          </SectionCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <SectionCard title="Positioned For">
            {positioning.map(p => (
              <Box key={p} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'success.main', mt: 0.8, flexShrink: 0 }} />
                <Typography variant="body2">{p}</Typography>
              </Box>
            ))}
          </SectionCard>
        </Grid>
      </Grid>
    </>
  );
}

function Section10() {
  return (
    <>
      <Typography variant="h6" fontWeight={700} gutterBottom>Search Parameters</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <SectionCard title="Targeting Criteria">
            <InfoRow label="Industries" value="Data Centers, Manufacturing, Solar Energy, Telecom, Utilities, Railways, Defense" />
            <InfoRow label="Company Size" value="50 – 1,000 employees" />
            <InfoRow label="Job Titles" value="CTO, VP Infrastructure, Plant Manager, Electrical Head, Project Director, Operations Head" />
            <InfoRow label="Target Locations" value="India (Maharashtra, Gujarat, TN, Karnataka, Delhi-NCR), MENA, Africa, SE Asia" />
          </SectionCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <SectionCard title="Keywords">
            {['Industrial UPS', 'Solar Inverter', 'BESS', 'Static Frequency Converter', 'Battery Charger', 'Servo Stabilizer', 'Hybrid Solar PCU'].map(k => (
              <Chip key={k} label={k} size="small" sx={{ mr: 0.5, mb: 0.5 }} variant="outlined" />
            ))}
          </SectionCard>
        </Grid>
        <Grid item xs={12}>
          <SectionCard title="Industry-Based Matching">
            {[
              { industry: 'Data Centers', products: 'Online UPS (5–600kVA), N+1 Redundancy, IoT Monitoring' },
              { industry: 'Manufacturing', products: 'Industrial UPS, Servo Stabilizers, 100% Unbalanced Load' },
              { industry: 'Solar Projects', products: 'Hybrid Solar Inverter, EnerCube BESS, Battery-less mode' },
              { industry: 'Railways/Defense', products: 'Battery Chargers (IP65), 400Hz SFC, Industrial UPS' },
              { industry: 'Oil & Gas', products: 'DC Battery Chargers for SCADA/Pipelines, Industrial UPS' },
            ].map(row => (
              <Box key={row.industry} sx={{ display: 'flex', gap: 2, mb: 1, alignItems: 'center' }}>
                <Chip label={row.industry} size="small" color="primary" sx={{ minWidth: 130 }} />
                <Typography variant="body2" color="text.secondary">{row.products}</Typography>
              </Box>
            ))}
          </SectionCard>
        </Grid>
      </Grid>
    </>
  );
}

function Section11() {
  return (
    <>
      <Typography variant="h6" fontWeight={700} gutterBottom>ICP – Ideal Customer Profile</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <SectionCard title="Profile Criteria">
            <InfoRow label="Revenue" value="₹50Cr to ₹500Cr" />
            <InfoRow label="Headcount" value="100 – 500 employees" />
            <InfoRow label="Geography" value="Industrial hubs in India (Pune, Ahmedabad, Chennai, Bangalore) and export markets in MENA/Africa" />
            <InfoRow label="Growth Stage" value="Companies expanding manufacturing lines or shifting towards renewable energy" />
            <InfoRow label="Digital Maturity" value="High – Interest in IoT monitoring, remote diagnostics, and smart energy management" />
          </SectionCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <SectionCard title="Target Industries">
            {['Manufacturing (Pharma, Auto, Plastic)', 'Solar EPC', 'Infrastructure', 'Defense'].map(i => (
              <Chip key={i} label={i} sx={{ mr: 0.5, mb: 0.5 }} />
            ))}
          </SectionCard>
        </Grid>
      </Grid>
    </>
  );
}

const sectionComponents: Record<number, React.FC> = {
  1: Section1, 2: Section2, 3: Section3, 4: Section4,
  5: Section5, 6: Section6, 7: Section7, 8: Section8,
  9: Section9, 10: Section10, 11: Section11,
};

// ─── Main Page ─────────────────────────────────────────────────────────────────

export const CompanyDetails: React.FC = () => {
  const [activeSection, setActiveSection] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const ActiveContent = sectionComponents[activeSection];

  return (
    <Box sx={{ display: 'flex', height: '100%', minHeight: 'calc(100vh - 70px)', bgcolor: '#f5f6fa', mt: '70px' }}>
      {/* Sidebar */}
      <Paper
        elevation={0}
        sx={{
          width: sidebarOpen ? 260 : 56,
          flexShrink: 0,
          borderRight: '1px solid',
          borderColor: 'divider',
          transition: 'width 0.2s ease',
          overflow: 'hidden',
          bgcolor: 'white',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Sidebar header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: sidebarOpen ? 'space-between' : 'center', px: sidebarOpen ? 2 : 1, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          {sidebarOpen && <Box />}
          <IconButton size="small" onClick={() => setSidebarOpen(o => !o)}>
            {sidebarOpen ? <ChevronLeftIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
          </IconButton>
        </Box>

        <List dense disablePadding sx={{ flex: 1, overflowY: 'auto' }}>
          {sidebarSections.map((section, idx) => (
            <React.Fragment key={section.id}>
              <ListItemButton
                selected={activeSection === section.id}
                onClick={() => setActiveSection(section.id)}
                sx={{
                  px: sidebarOpen ? 2 : 1.5,
                  py: 1.2,
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  '&.Mui-selected': {
                    bgcolor: 'primary.50',
                    borderRight: '3px solid',
                    borderColor: 'primary.main',
                    '& .MuiListItemText-primary': { color: 'primary.main', fontWeight: 700 },
                    '& svg': { color: 'primary.main' },
                  },
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Box sx={{ color: activeSection === section.id ? 'primary.main' : 'text.secondary', display: 'flex', alignItems: 'center', minWidth: sidebarOpen ? 28 : 'auto' }}>
                  {section.icon}
                </Box>
                {sidebarOpen && (
                  <ListItemText
                    primary={`${section.id}. ${section.label}`}
                    primaryTypographyProps={{ variant: 'body2', noWrap: true }}
                    sx={{ ml: 0.5 }}
                  />
                )}
              </ListItemButton>
              {idx < sidebarSections.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Paper>

      {/* Main content */}
      <Box sx={{ flex: 1, p: 3, overflowY: 'auto' }}>
        <ActiveContent />
      </Box>
    </Box>
  );
};

export default CompanyDetails;
