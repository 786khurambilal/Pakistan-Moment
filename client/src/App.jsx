import { useEffect, useState } from 'react';
import { fetchConfig, fetchJob, generateScene, generateStory, submitJob } from './lib/api.js';
import Backoffice from './steps/Backoffice.jsx';
import Landing from './steps/Landing.jsx';
import Capture from './steps/Capture.jsx';
import ChooseScene from './steps/ChooseScene.jsx';
import Quiz from './steps/Quiz.jsx';
import Generating from './steps/Generating.jsx';
import Result from './steps/Result.jsx';
import ArvoLogo from './components/ArvoLogo.jsx';
import ArvoMascot from './components/ArvoMascot.jsx';
import { DEMO } from './lib/demo.js';

const initialHash = typeof window !== 'undefined' ? window.location.hash : '';
const initialJobId = typeof window !== 'undefined' ? window.localStorage.getItem('pendingJobId') : null;
const isDemo = initialHash === '#demo';

export default function App() {
  const [hash, setHash] = useState(initialHash);
  const [step, setStep] = useState(isDemo ? 'result' : initialJobId ? 'generating' : 'landing');
  const [config, setConfig] = useState({ scenes: [], quiz: [], generationMode: 'manual' });
  const [face, setFace] = useState(null);
  const [sceneId, setSceneId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(isDemo ? DEMO.result : null);
  const [answersDemo] = useState(isDemo ? DEMO.answers : null);
  const [jobId, setJobId] = useState(initialJobId);
  const [activeMode, setActiveMode] = useState(initialJobId ? 'manual' : null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const onHash = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    fetchConfig()
      .then((c) => {
        setConfig(c);
        if (c.scenes?.length) setSceneId((prev) => prev || c.scenes[0].id);
      })
      .catch(() => setConfig({ scenes: [], quiz: [], generationMode: 'manual' }));
  }, []);

  const go = (s) => setStep(s);

  async function runGeneration(finalAnswers) {
    setError(null);
    setResult(null);
    setJobId(null);
    setStep('generating');
    try {
      const latestConfig = await fetchConfig();
      const mode = latestConfig.generationMode || config.generationMode || 'manual';
      setActiveMode(mode);
      if (mode === 'auto') {
        window.localStorage.removeItem('pendingJobId');
        const [sceneResult, storyResult] = await Promise.all([
          generateScene({ face, sceneId }),
          generateStory({ answers: finalAnswers, sceneId }),
        ]);
        setResult({
          image: sceneResult.image,
          story: storyResult.story,
          scene,
          answers: finalAnswers,
        });
        setStep('result');
        return;
      }

      const data = await submitJob({ face, answers: finalAnswers, sceneId });
      setJobId(data.job.id);
      window.localStorage.setItem('pendingJobId', data.job.id);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    }
  }

  useEffect(() => {
    if (step !== 'generating' || !jobId || error) return;
    let cancelled = false;

    async function poll() {
      try {
        const data = await fetchJob(jobId);
        if (cancelled) return;
        if (data.job?.status === 'complete' && data.job.result) {
          window.localStorage.removeItem('pendingJobId');
          setResult(data.job.result);
          setStep('result');
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Could not check job status.');
      }
    }

    poll();
    const timer = setInterval(poll, 3000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [step, jobId, error]);

  const scene = config.scenes.find((s) => s.id === sceneId) || null;

  if (hash === '#backoffice') {
    return (
      <div className="app-shell">
        <Header />
        <Backoffice />
        <Footer />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Header />

      {step === 'landing' && <Landing onStart={() => go('capture')} />}

      {step === 'capture' && (
        <Capture
          initial={face}
          onBack={() => go('landing')}
          onDone={(img) => {
            setFace(img);
            go('scene');
          }}
        />
      )}

      {step === 'scene' && (
        <ChooseScene
          scenes={config.scenes}
          selected={sceneId}
          onSelect={setSceneId}
          onBack={() => go('capture')}
          onNext={() => go('quiz')}
        />
      )}

      {step === 'quiz' && (
        <Quiz
          quiz={config.quiz}
          initial={answers}
          onBack={() => go('scene')}
          onSubmit={(a) => {
            setAnswers(a);
            runGeneration(a);
          }}
        />
      )}

      {step === 'generating' && (
        <Generating
          error={error}
          jobId={jobId}
          mode={activeMode}
          onRetry={() => runGeneration(answers)}
          onBack={() => go('quiz')}
        />
      )}

      {step === 'result' && result && (
        <Result
          image={result.image}
          story={result.story}
          scene={isDemo ? DEMO.scene : result.scene || scene}
          answers={isDemo ? answersDemo : result.answers || answers}
          onRestart={() => {
            setResult(null);
            setFace(null);
            setAnswers({});
            setJobId(null);
            setActiveMode(null);
            window.localStorage.removeItem('pendingJobId');
            go('landing');
          }}
          onRegenerate={() => runGeneration(answers)}
        />
      )}

      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="w-full mb-8">
      <div className="flex items-center justify-between w-full max-w-5xl mx-auto mb-4">
        <ArvoLogo width={90} />
        <div className="flex items-center gap-3 text-paper/80">
          <Crescent />
          <span className="font-display text-sm tracking-[0.35em] uppercase">Est. 1947</span>
          <Crescent />
        </div>
      </div>
      <div className="text-center">
        <h1 className="font-display text-5xl md:text-7xl font-bold text-paper drop-shadow">
          Pakistan Times
        </h1>
        <p className="mt-1 text-paper/70 font-body italic">
          Step into history - your 14 August front page
        </p>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-auto pt-10 text-center text-paper/40 text-sm">
      <p>Made for Independence Day · Powered by Arvo</p>
      {/* Fixed mascot bottom-right */}
      <div className="fixed bottom-4 right-4 z-50 pointer-events-none">
        <ArvoMascot width={70} />
      </div>
    </footer>
  );
}

function Crescent() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M14.5 3a9 9 0 1 0 6.9 14.8A7.5 7.5 0 0 1 14.5 3z" />
      <path d="M19 6.5l.7 1.7 1.8.2-1.4 1.2.5 1.8-1.6-1-1.6 1 .5-1.8-1.4-1.2 1.8-.2z" />
    </svg>
  );
}
