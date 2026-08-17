// MVPでは外部送信を行わず、入力内容をブラウザ上で保持するだけの簡易実装
export interface ContactForm {
  companyName: string;
  name: string;
  email: string;
  message: string;
}

const KEY = "ai-diagnosis-contact";

export function saveContact(form: ContactForm) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(form));
  } catch {
    // ignore
  }
}

export function loadContact(): ContactForm | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ContactForm) : null;
  } catch {
    return null;
  }
}
