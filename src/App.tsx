import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { Play, ArrowUpRight, Mail, Instagram, Youtube, Send, ChevronDown, X } from 'lucide-react';
import { useState, useEffect, FC } from 'react';
import projectsData from './projects.json';

// ==========================================
// НАСТРОЙКИ
// ==========================================

// 1. Время отображения одной фотографии автора (в миллисекундах)
export const SLIDER_INTERVAL_MS = 4000;

// 2. Массив с путями к фотографиям автора.
// Фотографии нужно будет положить в папку /public/img/
const AUTHOR_IMAGES = [
  '/img/DSC_0802.jpg',
  '/img/DSC_0830.jpg',
  '/img/DSC_0859.jpg',
  '/img/DSC_0870.jpg',
  '/img/DSC_0878.jpg',
  '/img/DSC_0890.jpg',
  '/img/DSC_0921.jpg',
  '/img/DSC_0927.jpg',
  '/img/DSC_0998.jpg',
  '/img/DSC_0998.jpg'
];

const publicAsset = (path: string) => {
  if (!path || /^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith('data:')) {
    return path;
  }

  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;
};

const SKILLS = [
  'Монтаж видео', 'Цветокоррекция', 'Моушн-дизайн', 'Звук', 'VFX', 'Креативное направление'
];

type ProjectSize = 'small' | 'medium' | 'large';

type Project = {
  id: string;
  title: string;
  category: string;
  vkVideoUrl: string;
  cover?: string;
  size?: ProjectSize;
  featured?: boolean;
};

const PROJECTS = projectsData as Project[];
const FEATURED_PROJECTS = PROJECTS.filter((project) => project.featured);

function getVkEmbedUrl(url: string) {
  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.pathname.includes('video_ext.php')) {
      return url;
    }

    const match = parsedUrl.pathname.match(/video(-?\d+)_(\d+)/);
    if (match) {
      return `https://vk.com/video_ext.php?oid=${match[1]}&id=${match[2]}&hd=2`;
    }
  } catch {
    const match = url.match(/video(-?\d+)_(\d+)/);
    if (match) {
      return `https://vk.com/video_ext.php?oid=${match[1]}&id=${match[2]}&hd=2`;
    }
  }

  return url;
}

// ==========================================
// ВНУТРЕННИЕ КОМПОНЕНТЫ
// ==========================================

// Компонент одной карточки проекта
const ProjectCard: FC<{ project: Project, index: number, onClick: (project: Project) => void }> = ({ project, index, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      onClick={() => onClick(project)}
      className={`group relative overflow-hidden rounded-xl bg-accent cursor-pointer ${project.size === 'large' ? 'md:col-span-2 lg:col-span-2 row-span-2' :
          project.size === 'medium' ? 'md:col-span-2 lg:col-span-1' : ''
        }`}
    >
      {project.cover ? (
        <img
          src={publicAsset(project.cover)}
          alt={project.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 bg-zinc-900"
        />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.18),transparent_30%),linear-gradient(135deg,#181818,#050505)]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>

      <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-white/70 mb-2">{project.category}</p>
            <h3 className="text-2xl md:text-3xl font-display font-bold">{project.title}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
            <Play className="w-5 h-5 ml-1 text-white" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Компонент слайдера с фотографиями автора
function AuthorSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % AUTHOR_IMAGES.length);
    }, SLIDER_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-zinc-900">
      <AnimatePresence>
        <motion.img
          key={index}
          src={publicAsset(AUTHOR_IMAGES[index])}
          alt="Данила Маркушин за работой"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          //grayscale
          className="absolute inset-0 w-full h-full object-cover hover:grayscale-0 transition-all duration-700"
        />
      </AnimatePresence>
      <div className="absolute inset-0 border border-white/10 rounded-2xl pointer-events-none"></div>
    </div>
  );
}

// ==========================================
// ГЛАВНЫЙ КОМПОНЕНТ
// ==========================================

export default function App() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const [page, setPage] = useState(() => window.location.pathname === '/projects' ? 'projects' : 'home');

  // Состояние для попап окна с видео
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handlePopState = () => {
      setPage(window.location.pathname === '/projects' ? 'projects' : 'home');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const openPage = (nextPage: 'home' | 'projects', hash?: string) => {
    const nextPath = nextPage === 'projects' ? '/projects' : '/';

    window.history.pushState({}, '', `${nextPath}${hash || ''}`);
    setPage(nextPage);
    setMobileMenuOpen(false);

    if (hash) {
      window.setTimeout(() => document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' }), 50);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6 mix-blend-difference">
        <button
          type="button"
          onClick={() => openPage('home')}
          className="text-xl font-display font-bold uppercase"
        >
          marg.ing
        </button>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <button type="button" onClick={() => openPage('home', '#work')} className="hover:text-white transition-colors">Работы</button>
          <button type="button" onClick={() => openPage('projects')} className="hover:text-white transition-colors">Проекты</button>
          <button type="button" onClick={() => openPage('home', '#about')} className="hover:text-white transition-colors">Обо мне</button>
          <button type="button" onClick={() => openPage(page === 'projects' ? 'projects' : 'home', '#contact')} className="hover:text-white transition-colors">Контакты</button>
        </div>
        <button
          type="button"
          aria-label="Открыть меню"
          onClick={() => setMobileMenuOpen((isOpen) => !isOpen)}
          className="md:hidden"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <>
              <div className="w-6 h-0.5 bg-white mb-1.5"></div>
              <div className="w-6 h-0.5 bg-white"></div>
            </>
          )}
        </button>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="fixed top-20 left-4 right-4 z-40 md:hidden rounded-xl border border-white/10 bg-black/90 backdrop-blur-xl p-4"
          >
            <button type="button" onClick={() => openPage('home', '#work')} className="block w-full py-3 text-left font-mono text-sm uppercase tracking-widest">Работы</button>
            <button type="button" onClick={() => openPage('projects')} className="block w-full py-3 text-left font-mono text-sm uppercase tracking-widest">Проекты</button>
            <button type="button" onClick={() => openPage('home', '#about')} className="block w-full py-3 text-left font-mono text-sm uppercase tracking-widest">Обо мне</button>
            <button type="button" onClick={() => openPage(page === 'projects' ? 'projects' : 'home', '#contact')} className="block w-full py-3 text-left font-mono text-sm uppercase tracking-widest">Контакты</button>
          </motion.div>
        )}
      </AnimatePresence>

      {page === 'home' ? (
        <>
      {/* Hero Section */}
      <section className="relative h-screen flex flex-col justify-center px-6 md:px-12 lg:px-24 pt-20">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <motion.div style={{ y }} className="w-full h-full">
            <div className="absolute inset-0 bg-black/60 z-10"></div>
            <img
              src={publicAsset('img/background_hero.JPG')}
              alt="Данила Маркушин"
              className="w-full h-full object-cover opacity-50 grayscale"
            />
          </motion.div>
        </div>

        <div className="relative z-10 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-muted font-mono text-sm md:text-base uppercase tracking-widest mb-4">
              Видеомонтажер
            </h2>
            <h1 className="text-5xl md:text-7xl lg:text-9xl font-display font-bold leading-[0.9] mb-8">
              СОБИРАЮ <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">
                ВИЗУАЛЬНЫЕ ИСТОРИИ
              </span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-6"
          >
            <button
              type="button"
              onClick={() => openPage('home', '#work')}
              className="group flex items-center gap-3 bg-white text-black px-6 py-4 rounded-full font-medium hover:bg-gray-200 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-4 h-4 ml-0.5" />
              </div>
              Смотреть шоурил
            </button>
            <p className="max-w-xs text-muted text-sm md:text-base">
              Монтаж, цвет, звук, графика и полный цикл производства контента для блогеров, артистов и брендов.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-muted"
        >
          <span className="text-xs uppercase tracking-widest font-mono">Листайте</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </motion.div>
      </section>

      {/* Marquee */}
      <div className="py-8 border-y border-white/10 bg-black overflow-hidden flex">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 20, ease: "linear", repeat: Infinity }}
          className="flex whitespace-nowrap"
        >
          {[...SKILLS, ...SKILLS, ...SKILLS, ...SKILLS].map((skill, i) => (
            <div key={i} className="flex items-center mx-8">
              <span className="text-2xl md:text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-white/20 to-white/5 uppercase tracking-wider">
                {skill}
              </span>
              <span className="mx-8 text-white/20">•</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Selected Works */}
      <section id="work" className="py-24 px-6 md:px-12 lg:px-24 bg-background">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <h2 className="text-4xl md:text-6xl font-display font-bold">ГОТОВЫЕ РАБОТЫ</h2>
            <p className="text-muted mt-4 max-w-md">Подборка избранных проектов: реклама, клипы, шоу, вертикальный контент и коммерческие ролики.</p>
          </div>
          <button
            type="button"
            onClick={() => openPage('projects')}
            className="flex items-center gap-2 text-sm font-mono uppercase tracking-widest hover:text-muted transition-colors group"
          >
            Все проекты
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[300px] md:auto-rows-[400px]">
          {FEATURED_PROJECTS.map((project, i) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={i}
              onClick={setSelectedProject}
            />
          ))}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-6 md:px-12 lg:px-24 bg-black border-t border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <AuthorSlider />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-6xl font-display font-bold mb-8">ОБО МНЕ</h2>
            <div className="space-y-6 text-lg text-muted">
              <p>Меня зовут Данила Маркушин - я видеомонтажёр и креативный специалист с опытом работы с 16 лет. Сейчас мне 19, и за это время я успел поработать как с крупными блогерами и артистами, так и с коммерческими проектами, включая международных заказчиков.
                <br />
                <br />
                Среди моих клиентов - известные медийные личности и проекты: Моргенштерн, Егор Крид, Михаил Литвин, Олег Кофе, Варпач, Адель Вейгель, Супер Стас, Медиа Баскет и другие. Также я участвовал в создании нейросетевой рекламы для Авито совместно с командой Никиты Величинского.
                <br />
                <br />
                Отдельно стоит отметить, что я работаю с зарубежным заказчиком из Дубая, создавая для него контент под социальные сети. Это дало мне опыт работы с международной аудиторией и понимание современных трендов на глобальном уровне.
                <br />
                <br />
                Я работаю с любыми форматами видео: от коротких вертикальных роликов (Reels, Shorts) до полноценных горизонтальных выпусков, подкастов и шоу. Работаю удалённо с заказчиками по всему миру. Помимо монтажа, могу взять на себя полный цикл производства: съёмка (в том числе мобильная), монтаж, цветокоррекция, чистка и обработка звука, создание превью и базовая 3D-графика. Важно: этап съёмки на данный момент доступен только в городе Пенза.
                <br />
                <br />   
                В работе использую профессиональные инструменты: Adobe Premiere Pro, Adobe After Effects, Adobe Photoshop, а также Blender. Отдельное направление - работа с нейросетями: от простых задач до сложных креативных решений под ключ.
                <br />
                <br />
                Я ценю сроки, всегда держу высокий уровень качества и подхожу к каждому проекту с максимальной вовлечённостью. Несмотря на молодой возраст, я уже обладаю серьёзным опытом и умею решать задачи любой сложности.
                <br />
                <br />
                Если вам нужен человек, который сделает не просто монтаж, а качественный и продуманный продукт - вы по адресу.</p>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-8">
              <div>
                <h4 className="text-4xl font-display font-bold mb-2">350+</h4>
                <p className="text-sm text-muted font-mono uppercase tracking-widest">Выполненных проектов</p>
              </div>
              <div>
                <h4 className="text-4xl font-display font-bold mb-2">4</h4>
                <p className="text-sm text-muted font-mono uppercase tracking-widest">Года опыта</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
        </>
      ) : (
        <main className="pt-36 pb-24 px-6 md:px-12 lg:px-24 bg-background min-h-screen">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="mb-16"
          >
            <p className="text-muted font-mono text-sm md:text-base uppercase tracking-widest mb-4">
              Полное портфолио
            </p>
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
              <h1 className="text-5xl md:text-7xl lg:text-9xl font-display font-bold leading-[0.9]">
                ВСЕ <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">ПРОЕКТЫ</span>
              </h1>
              <p className="text-muted max-w-md text-base md:text-lg">
                Подборка моих работ
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[300px] md:auto-rows-[400px]">
            {PROJECTS.map((project, i) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={i}
                onClick={setSelectedProject}
              />
            ))}
          </div>
        </main>
      )}

      {/* Contact / Footer */}
      <section id="contact" className="py-24 px-6 md:px-12 lg:px-24 bg-background relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-9xl font-display font-bold mb-8"
          >
            ДАВАЙТЕ <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">РАБОТАТЬ ВМЕСТЕ</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-xl text-muted mb-12 max-w-2xl"
          >
            Расскажите о задаче, формате и сроках. Я помогу довести видео до сильного, цельного результата.
          </motion.p>

          <motion.a
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            href="mailto:danil404you@gmail.com"
            className="group flex items-center gap-4 text-2xl md:text-4xl font-display font-bold hover:text-muted transition-colors mb-24"
          >
            <Mail className="w-8 h-8 md:w-10 md:h-10" />
            danil404you@gmail.com
            <ArrowUpRight className="w-8 h-8 md:w-10 md:h-10 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />
          </motion.a>

          <div className="w-full flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/10 text-sm text-muted font-mono uppercase tracking-widest">
            <p>© {new Date().getFullYear()} marg.ing Все права защищены.</p>
            <div className="flex gap-6 mt-6 md:mt-0">
              <a
                href="https://www.instagram.com/markush1n?igsh=MTNlMngwcXUxdTllOA%3D%3D&utm_source=qr"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors flex items-center gap-2"
              >
                <Instagram className="w-4 h-4" /> IG
              </a>
              <a href="#" className="hover:text-white transition-colors flex items-center gap-2">
                <Youtube className="w-4 h-4" /> YT
              </a>
              <a href="https://t.me/margingggg" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-2">
                <Send className="w-4 h-4" /> TG
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal Player (Окно с плеером) */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 md:p-12 cursor-pointer"
            onClick={() => setSelectedProject(null)} // Клик по фону закрывает видео
          >
            <button
              className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-[110]"
              onClick={() => setSelectedProject(null)}
            >
              <X className="w-10 h-10" />
            </button>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-7xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl relative"
              onClick={(e) => e.stopPropagation()} // Предотвращает закрытие при клике на само видео
            >
              <iframe
                src={getVkEmbedUrl(selectedProject.vkVideoUrl)}
                title={selectedProject.title}
                allow="autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
