type AtlasVariant = "hero" | "city" | "temple" | "kyoto" | "ming";

const ink = "#244e4a";
const red = "#b4513c";
const gold = "#c7a571";
const paper = "#f4f0e6";

const titles: Record<AtlasVariant, string> = {
  hero: "山峦、海纹、城门与层塔组成的跨海交流装饰示意",
  city: "以轴线、街道与建筑色块组成的都城装饰示意",
  temple: "山前寺院、庭院与树木的装饰示意",
  kyoto: "街巷与远处层塔组成的京都装饰示意",
  ming: "书卷、城市屋顶与船只组成的贸易装饰示意",
};

function Pagoda() {
  return (
    <g stroke={ink} strokeWidth="1.4" strokeLinejoin="round">
      <path d="M0 0V-19M-4-8H4M-3-13H3" fill="none" />
      <path d="M-10 23V8H10V23M-15 56V36H15V56M-21 94V71H21V94M-28 137V110H28V137" fill={paper} />
      <path d="M-28 27Q-12 20 0 0Q12 20 28 27L23 31H-23ZM-37 61Q-16 52 0 35Q16 52 37 61L30 66H-30ZM-48 100Q-19 92 0 70Q19 92 48 100L39 105H-39ZM-59 143Q-24 133 0 109Q24 133 59 143L49 149H-49Z" fill={ink} />
      <path d="M-34 149V178H34V149M-44 179H44M-50 184H50" fill={paper} />
      <path d="M-5 165V178H5V165ZM-3 46V55H3V46ZM-4 83V94H4V83ZM-5 122V136H5V122Z" fill={red} stroke="none" />
      <path d="M-21 33H21M-29 68H29M-38 107H38M-48 151H48" stroke={gold} />
    </g>
  );
}

function HeroArt() {
  return (
    <>
      <rect x="23" y="23" width="714" height="434" rx="1" fill="none" stroke={gold} strokeOpacity=".35" />
      <circle cx="392" cy="155" r="73" fill={gold} fillOpacity=".17" />
      <circle cx="392" cy="155" r="83" fill="none" stroke={gold} strokeOpacity=".45" strokeWidth=".8" />
      <path d="M-20 264L70 194L112 216L181 146L248 227L307 180L379 259L455 197L501 228L585 152L649 209L718 176L780 238V340H-20Z" fill={ink} fillOpacity=".065" />
      <path d="M-20 303L89 243L146 265L217 226L300 291L351 247L429 285L510 231L584 265L666 225L780 282V353H-20Z" fill={ink} fillOpacity=".085" />
      <g fill="none" stroke={ink} strokeWidth=".85" strokeOpacity=".27">
        <path d="M293 123Q325 118 344 123M443 108Q481 101 513 107M466 117H495" />
        <path d="M55 158Q84 153 111 157M95 167H133M595 100Q621 94 650 99" />
        <path d="M-15 348C83 320 160 368 252 345S415 324 508 346S672 370 775 337" />
        <path d="M-15 362C83 334 160 382 252 359S415 338 508 360S672 384 775 351" />
        <path d="M-15 377C83 349 160 397 252 374S415 353 508 375S672 399 775 366" />
        <path d="M-15 393C83 365 160 413 252 390S415 369 508 391S672 415 775 382" />
        <path d="M-15 410C83 382 160 430 252 407S415 386 508 408S672 432 775 399" />
        <path d="M-15 428C83 400 160 448 252 425S415 404 508 426S672 450 775 417" />
      </g>
      <path d="M42 332Q157 312 293 334L277 344Q153 329 42 342Z" fill={paper} />
      <g stroke={ink} strokeWidth="1.4" strokeLinejoin="round">
        <path d="M52 330V286H112V231H238V286H290V330Z" fill="#d7dfd4" />
        <path d="M52 286H71V279H88V286H105M245 286H262V279H279V286H290" fill="none" />
        <path d="M127 229V190H223V229" fill={paper} />
        <path d="M100 193Q134 183 151 164H199Q215 183 249 193L241 201H108Z" fill={ink} />
        <path d="M83 239Q116 231 133 214H217Q236 232 268 239L258 248H93Z" fill={ink} />
        <path d="M115 250H235M135 203H216" stroke={gold} />
        <path d="M151 330V293A24 24 0 0 1 199 293V330" fill={ink} />
        <path d="M170 330V295A7 7 0 0 1 184 295V330" fill={paper} fillOpacity=".6" stroke="none" />
        <path d="M147 207V221M175 207V221M203 207V221M129 267V279M220 267V279" stroke={red} strokeWidth="4" />
        <path d="M65 311H97M249 311H280M44 331H298" fill="none" />
      </g>
      <path d="M518 331Q606 311 695 331L702 342Q613 327 513 342Z" fill={paper} />
      <g transform="translate(607 143)"><Pagoda /></g>
      <g fill="none" stroke={red} strokeWidth="1.1" strokeOpacity=".7">
        <path d="M345 299Q381 287 418 299L410 308H354Z" fill={paper} />
        <path d="M381 299V261M380 264Q360 272 358 291H380M384 270Q399 277 403 291H384" />
      </g>
      <path d="M310 318Q348 312 376 317M399 323Q422 319 443 321" fill="none" stroke={gold} strokeWidth="1.4" />
      <g stroke={ink} strokeWidth="1" fill="none" strokeOpacity=".6">
        <path d="M468 145Q477 137 485 145Q492 137 500 143M517 165Q524 158 531 163Q537 157 544 161" />
      </g>
    </>
  );
}

function CityArt() {
  const blocks = [
    [66, 70, 38, 25], [117, 70, 38, 25], [205, 70, 38, 25], [256, 70, 38, 25],
    [66, 109, 38, 24], [117, 109, 38, 24], [205, 109, 38, 24], [256, 109, 38, 24],
    [66, 147, 38, 24], [117, 147, 38, 24], [205, 147, 38, 24], [256, 147, 38, 24],
  ];
  return (
    <>
      <circle cx="280" cy="48" r="32" fill={gold} fillOpacity=".2" />
      <path d="M18 64L72 31L104 48L145 23L191 58L240 34L296 66L343 39V191H18Z" fill={ink} fillOpacity=".055" />
      <path d="M48 53H312V188H48ZM57 62H303V179H57Z" fill="none" stroke={ink} strokeWidth="1" />
      <path d="M168 61H192V190H168Z" fill={red} fillOpacity=".18" />
      <path d="M58 101H302M58 140H302M110 62V178M249 62V178" stroke={gold} strokeWidth="2" strokeOpacity=".6" />
      {blocks.map(([x, y, w, h], i) => <rect key={i} x={x} y={y} width={w} height={h} fill={ink} fillOpacity={i % 3 === 0 ? ".24" : ".12"} stroke={ink} strokeWidth=".65" />)}
      <path d="M158 64V45H202V64M151 47L166 36H194L210 47ZM159 188V174H201V188M151 177L164 166H196L209 177Z" fill={ink} />
      <path d="M175 189V178H185V189" fill={paper} />
      <path d="M30 201H330M180 15V28" stroke={gold} strokeWidth="1" />
    </>
  );
}

function TempleArt() {
  return (
    <>
      <circle cx="273" cy="56" r="34" fill={gold} fillOpacity=".2" />
      <path d="M0 117L56 53L100 87L163 33L224 98L269 61L360 125V190H0Z" fill={ink} fillOpacity=".08" />
      <path d="M38 186Q163 165 322 188M58 196Q183 180 306 200" fill="none" stroke={gold} strokeOpacity=".7" />
      <g stroke={ink} strokeWidth="1.3" strokeLinejoin="round">
        <path d="M92 154V106H269V154Z" fill={paper} />
        <path d="M66 106Q107 95 131 71H229Q252 95 294 106L281 117H79Z" fill={ink} />
        <path d="M90 121H269" stroke={gold} />
        <path d="M108 122V153M140 122V153M220 122V153M252 122V153" stroke={red} strokeWidth="4" />
        <path d="M163 154V126H197V154" fill={ink} />
        <path d="M83 155H278V163H83ZM146 163H214V169H146ZM136 170H224V176H136Z" fill={paper} />
      </g>
      <g fill="none" stroke={ink} strokeWidth="1.1">
        <path d="M42 166V95M42 133L25 114M42 119L57 99M314 168V107M314 141L331 124" />
        <path d="M16 113Q15 91 34 94Q29 76 47 78Q67 80 61 102Q78 111 62 120Q48 127 33 118Q20 126 16 113ZM302 124Q292 109 305 103Q312 86 324 100Q342 99 340 115Q352 130 334 135Q313 139 302 124Z" fill={ink} fillOpacity=".1" />
      </g>
    </>
  );
}

function KyotoArt() {
  return (
    <>
      <circle cx="254" cy="53" r="33" fill={gold} fillOpacity=".2" />
      <path d="M0 113L67 67L106 91L164 51L216 91L290 55L360 106V153H0Z" fill={ink} fillOpacity=".07" />
      <path d="M166 130H195L255 220H92Z" fill={gold} fillOpacity=".16" />
      <g transform="translate(182 43) scale(.48)"><Pagoda /></g>
      <g stroke={ink} strokeWidth="1" strokeLinejoin="round">
        <path d="M0 122L78 128V187L0 207ZM79 127L129 132V163L79 185ZM130 131L156 134V151L130 164Z" fill="#dbe0d6" />
        <path d="M0 111L54 102L88 128L77 137L0 130ZM78 123L113 119L137 132L128 139L80 135ZM129 128L150 125L161 134L155 138L131 136Z" fill={ink} />
        <path d="M360 122L282 128V187L360 207ZM281 127L231 132V163L281 185ZM230 131L204 134V151L230 164Z" fill={paper} />
        <path d="M360 111L306 102L272 128L283 137L360 130ZM282 123L247 119L223 132L232 139L280 135ZM231 128L210 125L199 134L205 138L229 136Z" fill={ink} />
        <path d="M18 136V194M42 138V188M65 140V182M96 141V170M115 142V164M295 141V181M317 139V188M339 137V194M245 142V164M264 141V171" strokeOpacity=".6" />
        <path d="M11 156L70 151M290 151L350 156" stroke={red} strokeWidth="3" />
        <path d="M159 150L111 220M202 150L244 220M151 174H211M137 195H227" strokeOpacity=".32" fill="none" />
      </g>
    </>
  );
}

function MingArt() {
  return (
    <>
      <circle cx="272" cy="51" r="32" fill={gold} fillOpacity=".21" />
      <path d="M16 166Q88 151 156 165T344 163M16 181Q88 166 156 180T344 178M16 196Q88 181 156 195T344 193" fill="none" stroke={ink} strokeWidth=".8" strokeOpacity=".25" />
      <g transform="rotate(-7 109 104)" stroke={ink} strokeWidth="1.1">
        <path d="M48 50H165V157H48Z" fill={paper} />
        <path d="M48 50Q37 50 37 60V147Q37 157 48 157M165 50Q177 50 177 60V147Q177 157 165 157" fill="#e8deca" />
        <path d="M48 47V160M165 47V160" stroke={gold} strokeWidth="3" />
        <path d="M68 72H143V133H68Z" fill="none" strokeOpacity=".35" />
        <path d="M82 83V122M96 83V122M110 83V122M124 83V110M137 83V113" strokeOpacity=".3" />
        <rect x="130" y="123" width="10" height="10" fill={red} fillOpacity=".65" stroke="none" />
      </g>
      <g stroke={ink} strokeWidth="1" strokeLinejoin="round">
        <path d="M201 127V102H250V127M258 127V89H312V127" fill="#dbe0d6" />
        <path d="M193 103L212 88H238L259 103ZM249 91L268 73H300L322 91Z" fill={ink} />
        <path d="M218 127V112H232V127M277 127V101H293V127M191 130H326" fill={paper} />
        <path d="M204 168Q247 181 304 165L290 181Q244 191 216 180Z" fill={ink} />
        <path d="M253 169V119M254 122Q280 135 284 157H254Z" fill="#e5d6b8" />
        <path d="M248 133Q229 143 226 158H248Z" fill={paper} />
        <path d="M218 171H288" stroke={gold} />
      </g>
    </>
  );
}

export default function AtlasArt({ variant = "hero" }: { variant?: AtlasVariant }) {
  const isHero = variant === "hero";
  return (
    <svg className="atlas-art" viewBox={isHero ? "0 0 760 480" : "0 0 360 220"} xmlns="http://www.w3.org/2000/svg" role="img" aria-label={titles[variant]} focusable="false">
      <title>{titles[variant]}</title>
      <rect width={isHero ? 760 : 360} height={isHero ? 480 : 220} fill={paper} />
      {variant === "hero" && <HeroArt />}
      {variant === "city" && <CityArt />}
      {variant === "temple" && <TempleArt />}
      {variant === "kyoto" && <KyotoArt />}
      {variant === "ming" && <MingArt />}
    </svg>
  );
}
