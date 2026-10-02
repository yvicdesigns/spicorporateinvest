import corporateLogo from '../../logos/spi corporate/spi corporate.png';
import renaissanceLogo from '../../logos/scr renaissance/SCI La Renaissance.png';
import nouveauConceptLogo from '../../logos/nouveau concept/nouveau conceptpng.png';
import atelier5Logo from '../../logos/atelier5/atelier5.png';
import laManneLogo from '../../logos/Lamane/lamanne.png';
import spiAlimLogo from '../../logos/spialim/spi alim.png';
import zenSensLogo from '../../logos/zensens/zensens.png';
import spiEnergyLogo from '../../logos/SPI ENERGY /SPI ENERG.png';

export const CORPORATE_BRAND = {
  name: 'SPI Corporate Invest',
  logo: corporateLogo,
  primary: '#1e3a5f',
  secondary: '#d4a72c',
  soft: '#f5ead2'
};

export const BRANCH_BRANDS = {
  'sci-renaissance': {
    logo: renaissanceLogo,
    primary: '#356fae',
    secondary: '#ed6906',
    accent: '#25a6b8',
    soft: '#edf6fb'
  },
  'sci-espoir': {
    primary: '#0891b2',
    secondary: '#155e75',
    accent: '#67e8f9',
    soft: '#ecfeff'
  },
  'nouveau-concept': {
    logo: nouveauConceptLogo,
    primary: '#0b3f54',
    secondary: '#ef1b17',
    accent: '#c99a2e',
    soft: '#f7f1e4'
  },
  'atelier-5': {
    logo: atelier5Logo,
    primary: '#7a1b71',
    secondary: '#cf4fb1',
    accent: '#8b7cf6',
    soft: '#fdf2fb'
  },
  'la-manne': {
    logo: laManneLogo,
    primary: '#147a3f',
    secondary: '#202124',
    accent: '#d7bb87',
    soft: '#eef8f1'
  },
  'spi-alim': {
    logo: spiAlimLogo,
    primary: '#075bd8',
    secondary: '#f47700',
    accent: '#f7c768',
    soft: '#eff6ff'
  },
  'zen-sens': {
    logo: zenSensLogo,
    primary: '#00685f',
    secondary: '#f1ad12',
    accent: '#009687',
    soft: '#ecf9f6'
  },
  'spi-energy': {
    logo: spiEnergyLogo,
    primary: '#0879b9',
    secondary: '#f47736',
    accent: '#24a34a',
    soft: '#edf8fc'
  }
};

export const getBranchBrand = (id) => BRANCH_BRANDS[id] || CORPORATE_BRAND;
