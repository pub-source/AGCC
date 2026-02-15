import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VerifyEmail() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-dark/20 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="glass-card p-8 md:p-10 text-center">
          {/* Icon */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-violet-dark flex items-center justify-center mx-auto mb-6">
            <Mail className="h-10 w-10 text-primary-foreground" />
          </div>

          {/* Header */}
          <h1 className="font-serif text-3xl font-bold mb-4">Check Your Email</h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            We've sent a verification link to your email address. Please click the link to verify your account and complete your registration.
          </p>

          {/* Steps */}
          <div className="bg-secondary/50 rounded-xl p-6 mb-8 text-left space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-primary mb-4">
              What happens next?
            </h3>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-semibold shrink-0">
                1
              </div>
              <p className="text-sm text-muted-foreground">
                Click the verification link in your email
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-semibold shrink-0">
                2
              </div>
              <p className="text-sm text-muted-foreground">
                Your account will be verified automatically
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-semibold shrink-0">
                3
              </div>
              <p className="text-sm text-muted-foreground">
                An administrator will review and approve your role request
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-emerald-500 shrink-0" />
              <p className="text-sm text-muted-foreground">
                Once approved, you'll have full access to your dashboard
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Button variant="hero" className="w-full" asChild>
              <Link to="/login">Go to Login</Link>
            </Button>
            <p className="text-sm text-muted-foreground">
              Didn't receive the email?{" "}
              <button className="text-primary hover:underline font-medium">
                Resend verification
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
