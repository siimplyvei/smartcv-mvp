
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Download, User, BookOpen } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import Dashboard from "@/components/Dashboard";

const Index = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  const handleLogin = (userData: { name: string; email: string }) => {
    setUser(userData);
    setIsLoggedIn(true);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
  };

  if (isLoggedIn && user) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">SmartCV</h1>
            </div>
            <div className="space-x-4">
              <Button
                variant="ghost"
                onClick={() => {
                  setAuthMode('login');
                  setShowAuthModal(true);
                }}
              >
                Login
              </Button>
              <Button
                onClick={() => {
                  setAuthMode('signup');
                  setShowAuthModal(true);
                }}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Transform Your CV with
              <span className="text-blue-600"> AI Power</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Upload your current CV and let our advanced AI analyze, enhance, and optimize it for better job opportunities. Get a professional, ATS-friendly resume in minutes.
            </p>
            <Button
              size="lg"
              className="text-lg px-8 py-4"
              onClick={() => {
                setAuthMode('signup');
                setShowAuthModal(true);
              }}
            >
              Start Enhancing Your CV
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              How SmartCV Works
            </h3>
            <p className="text-lg text-gray-600">
              Three simple steps to get your enhanced CV
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Upload className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>1. Upload Your CV</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Simply drag and drop your current CV in PDF format. Our secure platform keeps your data safe.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle>2. AI Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Our AI analyzes your CV for content, structure, keywords, and formatting to identify improvement areas.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Download className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle>3. Download Enhanced CV</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Get your professionally enhanced, ATS-optimized CV ready to impress recruiters and land interviews.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to Stand Out?
          </h3>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of professionals who've enhanced their careers with SmartCV
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="text-lg px-8 py-4"
            onClick={() => {
              setAuthMode('signup');
              setShowAuthModal(true);
            }}
          >
            Create Your Account
          </Button>
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onLogin={handleLogin}
      />
    </div>
  );
};

export default Index;
