const StyleGrid = () => {
  // These represent the "Tailor Samples"
  const styles = [
    { 
      id: 1, 
      name: "Luxury Lace Gala", 
      tailor: "House of Zaid", 
      fabricType: "Lease (Lace)",
      image: "https://tse2.mm.bing.net/th/id/OIP.2-7BsWrlIyXjIasWsV4RSAHaI4?rs=1&pid=ImgDetMain&o=7&rm=3"
      
    },
    { 
      id: 2, 
      name: "Presidential Agbada", 
      tailor: "Kano Stitches", 
      fabricType: "Shadda",
      image: "https://od9jastyles.com/wp-content/uploads/2023/01/Ankara-skirts-and-blouses-2023-39.jpg"
    },
    { 
      id: 3, 
      name: "Modern Atamfa Wrap", 
      tailor: "Northern Chic", 
      fabricType: "Atamfa",
      image: "https://i.pinimg.com/736x/22/c2/a0/22c2a048cda9c77debf6e91c94fec0cb.jpg"
    },
    { 
      id: 4, 
      name: "Royal Kaftan", 
      tailor: "Abuja Tailors", 
      fabricType: "Shadda / Polished Cotton",
      image: "https://i.etsystatic.com/33778276/r/il/53ebb6/4920389498/il_800x800.4920389498_iarz.jpg"
    },
  ];
  
  return (
    <section className="px-6 py-20 md:px-12 bg-white">
      <div className="mb-12">
        <h2 className="text-xs font-black tracking-[0.5em] uppercase text-orange-600 mb-2">
          Step 1: Choose Your Style
        </h2>
        <h3 className="text-4xl font-serif italic text-slate-900">The Tailor's Lookbook</h3>
        <p className="text-slate-500 mt-4 max-w-xl">
          Browse authentic Nigerian styles. Once you pick a style, we will help you find the perfect fabric to match.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {styles.map((style) => (
          <div key={style.id} className="group cursor-pointer">
            {/* Style Image Container */}
            <div className="relative mb-6 aspect-[4/5] overflow-hidden bg-slate-100">
  <img 
    src={style.image} 
    alt={style.name} 
    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
  />
  
  {/* The Select Button Overlay */}
  <div className="absolute inset-0 bg-slate-900/20 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center">
    <button className="bg-white text-slate-900 px-6 py-3 text-xs font-black uppercase tracking-widest">
      Select Style
    </button>
  </div>
</div>
            
            {/* Style Info */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">
                  {style.fabricType}
                </span>
                <span className="text-[10px] text-slate-400 font-medium italic">
                  by {style.tailor}
                </span>
              </div>
              <h4 className="text-lg font-serif text-slate-900 group-hover:text-orange-600 transition-colors">
                {style.name}
              </h4>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StyleGrid;

