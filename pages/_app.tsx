import type { AppProps } from "next/app";
import { useRouter } from "next/router"; // Import useRouter
import { AnimatePresence, motion } from "framer-motion";
import Layout from "../components/Layout";
import SolanaProvider from "../components/SolanaProvider";
import "../styles/globals.css";
import "../styles/transitions.css";
import { ThemeProvider } from "next-themes";

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter(); // Initialize the router

  return (
    <ThemeProvider attribute="class">
      <SolanaProvider>
        <Layout>
          <AnimatePresence mode="wait">
            <motion.div
              key={router.route}
              className="page-transition"
              variants={{
                initial: { opacity: 0 },
                animate: { opacity: 1 },
                exit: { opacity: 0 },
              }}
            >
              <Component {...pageProps} />
            </motion.div>
          </AnimatePresence>
        </Layout>
      </SolanaProvider>
    </ThemeProvider>
  );
}

export default MyApp;
