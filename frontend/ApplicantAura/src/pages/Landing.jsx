import React from "react";
import { Navbar } from "../components";
import { Link } from "react-router-dom";
import mockup1 from "../assets/mockup1.png";

const Landing = () => {
  return (
    <>
      <Navbar />
      <section className="bg-white lg:px-4">
        <div className="mx-auto grid max-w-screen-xl py-8 px-4 lg:grid-cols-12 lg:gap-8 lg:py-16 xl:gap-0">
          <div className="mr-auto place-self-center lg:col-span-7">
            <h1 className="mb-4 max-w-2xl text-4xl font-bold leading-none text-black md:text-5xl xl:text-6xl">
              MilvusMatch — a solution for PM Internship Scheme
            </h1>
            <p className="mb-6 max-w-2xl font-light text-gray-600 md:text-lg lg:mb-8 lg:text-xl">
              Track, organize, and automate your job and internship search with AI-powered insights and cloud automation. Stay ahead in your career journey with personalized recommendations and deadline reminders.
            </p>
            <Link
              to="/register"
              className="mr-3 inline-flex items-center justify-center rounded-md bg-[#FF9933] py-3 px-5 text-white hover:bg-[#e68a2e] transition-colors duration-200"
            >
              Get Started
              <svg
                className="ml-2 -mr-1 h-5 w-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </Link>
            <Link
              to="/internships"
              className="inline-flex items-center justify-center rounded-md border border-[#138808] text-[#138808] py-3 px-5 hover:bg-[#138808] hover:text-white transition-colors duration-200"
            >
              Explore Matchmaking
            </Link>
          </div>
          <div className="hidden lg:col-span-5 lg:mt-0 lg:flex">
            <img
              src={mockup1}
              width="300"
              alt="MilvusMatch Dashboard Preview"
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">
            Core Features
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="feature-card bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">AI Job & Internship Recommendations</h3>
              <p className="text-gray-600">
                Get personalized suggestions based on your skills, interests, and profile.
              </p>
            </div>
            <div className="feature-card bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Application Tracking</h3>
              <p className="text-gray-600">
                Monitor the progress and status of your job and internship applications easily.
              </p>
            </div>
            <div className="feature-card bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Organized Document Management</h3>
              <p className="text-gray-600">
                Manage resumes, cover letters, and certificates in one secure place.
              </p>
            </div>
            <div className="feature-card bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Deadline Reminders</h3>
              <p className="text-gray-600">
                Never miss application deadlines with automated alerts and notifications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PM Internship Scheme Section */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-4">PM Internship Scheme</h2>
              <p className="text-gray-700 mb-4">
                A smart, automated system that matches students to internships using AI/ML, based on
                skills, qualifications, location preferences, and sector interests. It accounts for
                affirmative action (rural/aspirational districts, social categories), past participation,
                and industry capacity.
              </p>
              <ul className=" list-disc pl-5 space-y-2 text-gray-700 mb-6 ">
                <li>AI-based matchmaking for internship placement</li>
                <li>Candidate profile: skills, education, preferences</li>
                <li>Affirmative action and participation history</li>
                <li>Transparent scoring with explanations</li>
              </ul>
              <Link to="/register" className=" inline-flex items-center rounded-md bg-indigo-600 py-3 px-5 text-white hover:bg-indigo-700 transition-colors duration-200 ">
                Try the Prototype
              </Link>
            </div>
            <div className=" flex items-center justify-center ">
              <img src={mockup1} width="360" alt="PM Internship Scheme Prototype" className=" rounded-lg shadow-lg "/>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Landing;
