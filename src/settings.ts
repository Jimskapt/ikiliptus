import tools from './tools';

const settings = {
  i18n: null,
  eventBus: null,
  databases: null,
  vuetify: null,
  momentJS: null,
  locale: {
    value: 'en-US',
    get() {
      return this.value;
    },
    set(value: any) {
      if (value !== '' && value !== this.value) {
        tools.setCookie('locale', value);

        this.value = value;

        if (settings.i18n !== null) {
          (settings.i18n as any).locale = this.value;
        }
        if (settings.momentJS !== null) {
          (settings as any).momentJS.locale(this.value);
        }
      }
    },
  },
  load() {
    const cookies = tools.getCookies();

    if ((cookies as any).locale !== undefined) {
      this.locale.set((cookies as any).locale);
    }
  },
};

export default settings;
