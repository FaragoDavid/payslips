import { LOCALE } from '../utils/format.js';
import { useDataset } from '../data/store.jsx';

const shared = {
  title: 'Munkabér',
  months: Array.from({ length: 12 }, (_unused, monthIndex) => new Date(2000, monthIndex, 1).toLocaleString(LOCALE, { month: 'short' })),
  dashboard: {
    refreshButton: 'Frissítés',
    noData: 'Nincs elérhető adat. Adj hozzá fizetési adatokat a Firestore-ban.',
    errorMessage: 'Hiba az adatok betöltése során.',
    loading: 'Betöltés...',
    viewNames: {
      monthlyTable: 'Havi Részletek',
      monthlyNormBar: 'Havi arányok',
      yearlyTable: 'Éves részletek',
      yearlyNormBar: 'Éves arányok',
      yearlyBar: 'Éves összehasonlítás',
      trendLine: 'Éves trend',
      hourlyRateTrend: 'Órabér trend',
      standbyHourlyRate: 'Készenléti órabér',
    },
  },
  table: {
    net: 'Nettó',
  },
  addForm: {
    addButton: 'Hozzáadás',
    year: 'Év',
    month: 'Hónap',
    save: 'Mentés',
    cancel: 'Mégse',
  },
  dataset: {
    david: 'Dávid',
    niki: 'Niki',
  },
};

const davidStrings = {
  fields: {
    monthly_salary: 'Havibéresek időbére',
    absence_pay: 'Távolléti díj',
    absence_pay_base: 'Távolléti díj alap',
    visp_bonus: 'Jut. bon bónusz VISP',
    rsu_bonus: 'RSU bónusz',
    extra_task_by_phone: 'Extra task by phone',
    car_compensation: 'Cégautó megváltás',
    cash_benefit: 'Készpénzes juttatás',
    standby_supplement_correction: 'Készenléti bérpótlék korrekció',
    commute_cost: 'Munkába járás költsége',
    in_kind_pay: 'Természetben adott bér',
    safety_glasses: 'Védőszemüveg',
    tax_advance: 'Adóelőleg',
    other_deductions: 'Egyéb munkavállalói levonások',
    tb_charge: 'TB járulék',
    in_kind_pay_net: 'Természetben adott bér nettó',
    szep_card: 'SZÉP kártya',
    health_service: 'Egészségügyi szolg.',
    safety_net_program: 'Védőháló program',
    work_days: 'Munkanap',
    calendar_days: 'Naptári nap',
    work_hours: 'Munkaóra',
    standby_hours: 'Készenlét',
  },
  groups: {
    basePay: 'Alapbér',
    bonus: 'Bónusz',
    benefits: 'Juttatás',
  },
  categories: {
    income: 'Bevétel',
    deductions: 'Levonások',
    cafeteria: 'Cafeteria',
    workTime: 'Munkaidő',
  },
};

const nikiStrings = {
  fields: {
    monthly_basic_pay: 'Havi alapbér',
    afternoon_shift_bonus: 'Délutáni műszakpótlék 30%',
    weekend_allowance: 'Hétvégi pótlék 50%',
    benefit_gross_up: 'Juttatás bruttósítás',
    other_wage: 'Egyéb munkabér',
    paid_public_holiday: 'Fizetett ünnepnap',
    vacation: 'Szabadság',
    overtime_basis: 'Túlóra alap',
    balance_overtime: 'Egyenleg túlóra 50%',
    paid_full_day_absence: 'Fizetett egésznapos távollét',
    foreign_exchange_all: 'Deviza juttatás',
    szja: 'SZJA',
    tb_hozzajarulas: 'TB hozzájárulás',
    employees_discount: 'Dolgozói kedvezmény',
    meal_contribution: 'Étkezési hozzájárulás',
    gift_card: 'Ajándékkártya',
    work_days: 'Munkanap',
    calendar_days: 'Naptári nap',
    work_hours: 'Munkaóra',
  },
  groups: {},
  categories: {
    income: 'Bevétel',
    deductions: 'Levonások',
    memoItems: 'Tájékoztató tételek',
    workTime: 'Munkaidő',
  },
};

export function useStrings() {
  const { dataset } = useDataset();
  const { fields, groups, categories } = dataset === 'niki' ? nikiStrings : davidStrings;
  return { ...shared, fields, groups, categories };
}
