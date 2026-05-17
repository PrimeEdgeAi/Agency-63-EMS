import KCBLogo from '../../../../../public/kcb-logo.png'
// import EquityLogo from '../../../../public/equity-logo.png'
// import SafaricomLogo from '../../../../public/safaricom-logo.png'

const ModuleData = {
  name: 'Non-Alcoholic Module',
  description: 'Welcome to the Non-Alcoholic Module!',
  image: KCBLogo,

  companies: [
    {
      id: 1,
      logo: KCBLogo,          // ← real imported image
      name: 'KCB Group',
      category: 'Sparkling Waters',
      status: 'active',       // 'active' | 'review' | 'inactive'
      revenue: 1100000,
      revenueFormatted: '$1.1M',
      growth: '+14%',
      margin: '38%',
      contracts: 3,
      sku: 24,
      markets: '12 countries',
      founded: 2018,
      manager: 'Sarah Njoroge',
      renewal: 'Nov 2025',
    },
    // Duplicate this block for each company and swap the logo import:
    // {
    //   id: 2,
    //   logo: EquityLogo,
    //   name: 'Equity Bank',
    //   category: 'Botanical Teas',
    //   status: 'active',
    //   revenue: 890000,
    //   revenueFormatted: '$890K',
    //   growth: '+22%',
    //   margin: '42%',
    //   contracts: 2,
    //   sku: 18,
    //   markets: '8 countries',
    //   founded: 2020,
    //   manager: 'David Mwangi',
    //   renewal: 'Mar 2026',
    // },
  ],
}

export default ModuleData