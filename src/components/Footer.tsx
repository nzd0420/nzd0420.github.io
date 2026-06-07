import { useI18n } from "../i18n";

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="site-footer">
      <span>LongNeckCAT</span>
      <span>{t.footer.built}</span>
    </footer>
  );
}
