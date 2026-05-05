const Hero = () => {
  return (
    <header className="relative flex h-[70vh] items-center justify-center overflow-hidden bg-slate-900 text-white">
      <div className="relative z-10 text-center px-4">
        <h1 className="mb-4 text-5xl font-extrabold md:text-7xl">
          Authentic African <br />
          <span className="text-orange-500">Excellence.</span>
        </h1>
        <p className="mx-auto mb-8 max-w-lg text-lg text-slate-300">
          Discover a curated marketplace of premium African goods, from hand-crafted decor to modern fashion.
        </p>
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 justify-center">
          <button className="rounded-full bg-orange-600 px-8 py-3 font-bold text-white transition hover:bg-orange-700">
            Shop Now
          </button>
          <button className="rounded-full border-2 border-white px-8 py-3 font-bold transition hover:bg-white hover:text-slate-900">
            Our Story
          </button>
        </div>
      </div>
      <div className="absolute top-0 left-0 h-full w-full opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-500 via-transparent to-transparent"></div>
    </header>
  );
};

export default Hero;