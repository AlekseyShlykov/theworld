#!/usr/bin/env python3
"""
Apply French, Japanese and Spanish round translations to texts_fr.json, texts_ja.json, texts_es.json.
Run from project root: python3 scripts/translate_rounds_fr_ja.py
"""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# French rounds 3-8 (rounds 1-2 already done)
FR_ROUNDS = {
    "3": {
        "introText": "Encore mille ans ont passé. Tous les centres de civilisation ont grandi, chacun à sa manière. Ceux qui ont obtenu les cultures les plus efficaces plus tôt se sont étendus plus vite. Tôt ou tard, toute technologie atteint une limite. Il y a un maximum de terres qu'une personne peut cultiver à la main.\n\nPour faire le bond suivant, les gens avaient besoin de quelque chose de nouveau — des aides qui puissent tirer la charrue, fournir viande, lait et laine. Ces aides, ce furent les animaux domestiques.\n\nVoyons ce qui s'est passé dans chaque centre.",
        "zoneTexts": {
            "1": "Les mille dernières années ont été un succès pour Montagne Orange. Les meilleures cultures ont été trouvées rapidement, et les terres se sont étendues.\n\nCe millénaire s'annonce prometteur aussi — il y a assez de grands animaux pour que certains puissent convenir à l'élevage.",
            "2": "Le développement a été difficile dans Vallée Bleue à cause de la faible variété de plantes comestibles. Les voisins n'ont cessé de faire pression, tentant de s'emparer des terres fertiles.\n\nMais ce millénaire apporte une chance. Il y a ici beaucoup de grands animaux, et certains pourraient convenir à la domestication.",
            "3": "Les Jungles Jaunes ont grandi régulièrement. Les terres se sont étendues, les meilleures cultures étaient abondantes, et les seuls obstacles étaient les barrières naturelles — montagnes et rivières.\n\nLes mille ans à venir seront difficiles. Il n'y a presque pas de grands animaux ici, et les chances de trouver des espèces adaptées sont très faibles.",
            "4": "Tout s'est bien passé à Rivière Verte. La richesse en plantes a assuré une croissance rapide, et les voisins n'ont pas gêné.\n\nAvec les animaux, c'est différent. Ils sont peu nombreux, et trouver des espèces adaptées sera difficile.",
            "5": "Ce millénaire a été difficile pour Croissant Rouge. Peu de plantes, forte concurrence.\n\nMais il y a ici très nombreux grands animaux. Cela ouvre de vastes possibilités — les utiliser pour l'élevage, les élever pour la viande, les utiliser pour le transport."
        },
        "preChoiceText": "Dans le prochain millénaire, les gens commenceront à domestiquer les animaux. Ils tireront la charrue, fourniront viande, laine et serviront de transport.\n\nMais une domestication réussie est toujours un mélange de chance et des traits des animaux. Certains sont dociles, d'autres non ; certains ne se reproduisent pas en captivité, d'autres ont besoin de trop de nourriture. Quel centre aura de la chance cette fois ?",
        "postChoiceText": "Durant ce millénaire, les humains ont domestiqué de nombreux animaux, et cela a transformé l'élevage. Bovins, moutons, chèvres, porcs et chevaux sont devenus le fondement de l'agriculture et de la vie quotidienne.\n\nMais le succès était impossible sans chance : tous les animaux ne sont pas aptes à la domestication. Le régime alimentaire, le taux de croissance, la capacité à se reproduire en captivité, le comportement de troupeau et bien sûr le tempérament comptaient tous.\n\nPar exemple, les zèbres diffèrent à peine des chevaux, mais ils n'ont jamais été domestiqués — ils sont trop agressifs.\n\nLes animaux domestiques ont donné aux sociétés un élan considérable : plus de nourriture, plus de vêtements, le transport et de nouveaux outils. Ils sont devenus une partie cruciale de l'histoire humaine."
    },
    "4": {
        "introText": "La domestication des animaux a ouvert la voie à de plus grandes récoltes et à un élevage plus prévisible. Les marchands purent voyager plus loin, et les bêtes de somme portèrent de lourdes charges, accélérant le commerce et l'échange d'idées.\n\nMais ce progrès a créé un nouveau problème : il y avait trop d'informations. La mémoire ne pouvait plus suivre, et transmettre le savoir sur de longues distances était devenu presque impossible. Il fallait inventer quelque chose pour enregistrer ces informations. Ce fut ainsi que l'écriture est apparue.\n\nVoyons quelles conditions chaque centre avait.",
        "zoneTexts": {
            "1": "À Montagne Orange, tout s'est développé rapidement. Assez d'animaux, de bonnes récoltes, une population croissante.\n\nMais les barrières naturelles — les mêmes montagnes et rivières qui protégeaient autrefois des envahisseurs — gênent maintenant. Le commerce est plus lent, et les idées arrivent moins vite.",
            "2": "À Vallée Bleue, la grande variété d'animaux a permis une hausse rapide de la production alimentaire. Le territoire a grandi, et les voisins ont commercé et partagé des idées.\n\nLes conditions pour que l'écriture émerge ici sont les plus favorables. Il y a beaucoup à suivre, beaucoup de partenaires commerciaux, et un besoin clair d'enregistrer les informations.",
            "3": "Les Jungles Jaunes ont eu des difficultés dans les mille dernières années. Il n'y a presque pas d'animaux, et la terre est encore cultivée à la main.\n\nLe besoin d'écriture est faible ici, et les voisins encore moins. Inventer l'écriture dans de telles conditions est difficile.",
            "4": "À Rivière Verte, il y a peu de grands animaux — c'était un atout pour la sécurité. Mais quand il a fallu augmenter les rendements, c'est devenu une faiblesse.\n\nLe commerce se développe ici, et les voisins deviennent de plus en plus des partenaires plutôt que des ennemis. Peut-être que l'écriture apparaîtra par emprunt.",
            "5": "À Croissant Rouge, les mille dernières années ont été un succès. Les animaux ont été domestiqués tôt, et le commerce a prospéré.\n\nL'écriture a de bonnes chances d'apparaître ici — il y a la demande, le besoin, et des voisins qui réfléchissent dans la même direction et expérimentent."
        },
        "preChoiceText": "Dans le prochain millénaire, l'écriture apparaîtra ou sera empruntée dans tous les centres de civilisation. Mais celui qui le fera le premier gagnera un énorme avantage.\n\nDans quelle région cette idée prendra-t-elle feu ?",
        "postChoiceText": "L'écriture n'est apparue dans l'histoire humaine qu'une ou quelques fois. Pour autant qu'on sache, d'abord chez les Sumériens, puis chez les peuples indigènes du Mexique. Les systèmes égyptien et chinois ont peut-être émergé indépendamment aussi.\n\nBien plus souvent, l'écriture s'est répandue par l'échange et le commerce. Quelqu'un l'a vue chez les voisins et a commencé à créer son propre système, sachant déjà que c'était possible.\n\nPour que l'écriture prenne racine, il fallait des ressources. Des scribes capables d'écrire et de tenir les comptes, et un besoin de stocker et de transmettre l'information.\n\nEt avec le temps, l'écriture est devenue un outil pour l'émotion, l'histoire et la littérature."
    },
    "5": {
        "introText": "Désormais, l'écriture fait partie de la vie dans tous les centres de civilisation. Ici elle sert surtout à la comptabilité, là on en est déjà aux premiers livres.\n\nLes civilisations se sont renforcées, ont appris à gouverner de vastes territoires et à commercer de plus en plus entre elles. Elles échangent idées, plantes, animaux et technologies.\n\nEt voici qu'entre en jeu un facteur que personne ne choisit — la géographie du continent. Voyons dans quel état chacun est parvenu à ce stade.",
        "zoneTexts": {
            "1": "À Montagne Orange, l'écriture est apparue tôt, bien qu'elle se soit développée de façon singulière faute de voisins nombreux.\n\nMaintenant l'enjeu est le commerce et l'échange d'idées. Ce qui compte le plus, c'est la forme du continent : s'étire-t-il du nord au sud ou d'est en ouest ? Cela détermine la facilité avec laquelle plantes et animaux se diffusent.",
            "2": "À Vallée Bleue, l'écriture s'est développée vite et bien. Les gens ont appris à enregistrer le savoir et à le transmettre.\n\nLes continents étirés d'est en ouest ont un avantage énorme : le climat est semblable à une même latitude, donc les plantes n'ont pas besoin de s'adapter.\n\nLes conditions de croissance sont plutôt bonnes.",
            "3": "L'écriture est apparue dans les Jungles Jaunes, mais tard. Pas de besoin urgent, ni assez de voisins pour emprunter l'idée.\n\nLes mille ans à venir seront difficiles. Le continent s'étire du nord au sud, donc à chaque pas une nouvelle zone climatique, de nouvelles maladies, de nouveaux obstacles.",
            "4": "Rivière Verte s'est développée progressivement. L'écriture a aidé à gouverner de vastes territoires.\n\nMais les barrières naturelles — déserts, montagnes, océans — entravent l'échange d'idées.",
            "5": "À Croissant Rouge, la civilisation s'est développée rapidement. L'écriture est apparue tôt ou a été empruntée.\n\nLe continent s'étire d'est en ouest, donc le climat est semblable sur de longues distances. Cela crée d'excellentes opportunités pour le commerce et la diffusion des technologies."
        },
        "preChoiceText": "Cette fois, la géographie joue un rôle décisif — même si tous les facteurs précédents comptent encore.\n\nOù les marchands auront-ils le plus de chance, et leurs caravanes atteindront-elles le plus souvent les voisins ?",
        "postChoiceText": "L'orientation des continents est l'une des raisons clés des différences de rythme de développement. Sur les continents étirés d'est en ouest, les zones climatiques vont en parallèle. Les mêmes cultures qui poussent dans une région peuvent donc facilement s'implanter dans une autre à la même latitude.\n\nSur les continents étirés du nord au sud, en revanche, le climat change brutalement : tempéré, subtropical, tropical. Ces changements rendent bien plus difficile la diffusion des plantes et des animaux.\n\nDans chaque nouvelle zone climatique, il faut de nouvelles plantes, de nouveaux animaux, de nouvelles techniques — et ce n'est pas toujours facile."
    },
    "6": {
        "introText": "La géographie a fortement influencé le développement des civilisations. Mais l'humanité fait face à un nouveau défi — né des succès passés. Les épidémies.\n\nPour qu'une maladie devienne une épidémie, il faut plusieurs conditions. Les plus importantes : des villes denses et la proximité du bétail. La croissance des populations urbaines et l'importance du commerce entre les villes ont créé des voies idéales pour l'apparition et la propagation des maladies.",
        "zoneTexts": {
            "1": "À Montagne Orange, tout allait bien. La population grandissait, les territoires s'étendaient.\n\nMais les conditions pour les épidémies sont réunies ici. Montagnes et rivières ralentiront un peu la propagation des maladies, mais ne l'arrêteront pas.",
            "2": "Les mille dernières années ont été un succès pour Vallée Bleue. Le commerce a prospéré, les idées ont circulé.\n\nMais maintenant les villes denses et les routes commerciales animées apporteront non seulement des biens mais aussi des maladies.",
            "3": "Les Jungles Jaunes ont grandi lentement, mais c'est devenu un atout.\n\nPeu de bétail et peu de peuplements denses ici, donc les épidémies auront plus de mal à s'installer.",
            "4": "La population et l'échange d'idées ont grandi à Rivière Verte. Les premiers contacts par-delà l'océan ont commencé.\n\nLes maladies apparaîtront, mais en moins grand nombre qu'ailleurs à cause de l'isolement. Il n'empêche, on ne peut pas éviter complètement les épidémies.",
            "5": "Les mille dernières années ont été un âge d'or pour Croissant Rouge. La population a grandi, le commerce a prospéré.\n\nMais c'est précisément ce qui rend la région vulnérable : une population énorme et une position au carrefour des routes commerciales. Les épidémies commenceront sans doute ici puis suivront ces routes."
        },
        "preChoiceText": "Il est temps de choisir à nouveau. Où apparaîtra un guérisseur ou un savant qui comprendra le premier comment contenir les épidémies ?",
        "postChoiceText": "Les épidémies ont changé le monde autant que les guerres. Les maladies européennes ont tué plus de gens dans le Nouveau Monde que les Européens eux-mêmes. Les germes de l'Ancien Monde se sont révélés bien plus mortels que les locaux, et les Européens y étaient immunisés.\n\nPourquoi ? Beaucoup d'épidémies sont nées des animaux domestiques. Eux aussi souffraient de « maladies de la promiscuité », et certaines ont gagné l'homme.\n\nDès qu'on a domestiqué les animaux, on a gagné à la fois d'énormes avantages et de sérieux risques. Mais plus tard, le développement de la médecine, surtout des vaccins, a donné aux gens les moyens de contenir les épidémies."
    },
    "7": {
        "introText": "Nous sommes presque à notre époque. Les épidémies ont coûté beaucoup de vies dans certaines régions mais à peine touché d'autres. Ces « chanceux » manquent aussi d'immunité, et d'autres épreuves les attendent.\n\nMaintenant le moteur principal du développement, c'est la technologie. Elle a toujours évolué, bien sûr, mais c'est seulement maintenant qu'elle commence à façonner le cours de l'histoire. Inventer ne suffit pas — il faut que la société puisse l'adopter et en bénéficier.\n\nLes inventions naissent de la curiosité des individus. Les technologies, elles, viennent de l'accumulation de savoirs multiples qui se nourrissent les uns les autres. Pour créer l'imprimerie, une idée ne suffit pas — il faut du papier, la métallurgie, les caractères mobiles, l'encre, les presses, et bien sûr l'écriture.\n\nVoyons comment nos centres se développeront dans le prochain millénaire.",
        "zoneTexts": {
            "1": "L'isolement a aidé Montagne Orange à éviter les pires épidémies. Les frontières ont été fermées à temps, et les maladies passaient rarement.\n\nMais maintenant ce même isolement devient un obstacle. Quand une société n'interagit pas avec ses voisins, la technologie stagne — ou disparaît si elle perd temporairement sa valeur pratique.",
            "2": "Les épidémies ont coûté beaucoup de vies à Vallée Bleue. Mais elles ont aussi stimulé le développement de la médecine. L'espérance de vie a augmenté, les gens ont eu plus de temps pour expérimenter et découvrir.\n\nCe centre a d'excellentes conditions pour le progrès technologique : beaucoup de voisins, un commerce actif, un échange constant d'idées par les migrations et le choc des cultures.",
            "3": "Les Jungles Jaunes ont bénéficié d'être loin des grandes routes commerciales. Les épidémies ont à peine touché la région. La population a grandi, le territoire s'est étendu.\n\nMais peu de voisins signifient moins d'idées à emprunter. Certaines inventions peuvent apparaître ici sans jamais se répandre, faute de besoin.",
            "4": "Un commerce limité a protégé Rivière Verte des pires effets des épidémies. Pourtant des maladies sont arrivées et ont réduit la population.\n\nNéanmoins les conditions de croissance technologique sont bonnes. Pas beaucoup de voisins, mais assez pour que certaines inventions prennent racine et se diffusent.",
            "5": "À Croissant Rouge, les mille dernières années ont été dures. Les épidémies ont porté un coup terrible ; population et territoire ont diminué.\n\nMais cela a forcé les gens à développer la médecine et à chercher des solutions. Maintenant que le commerce reprend, ce centre peut se développer plus vite que les autres."
        },
        "preChoiceText": "Il est temps de choisir. Où apparaîtront les savants les plus curieux ? Où les dirigeants seront-ils assez audacieux pour investir dans les nouvelles idées et en profiter ?",
        "postChoiceText": "D'où viennent les technologies ?\n\nL'envie d'inventer est un trait humain partout. Mais inventer est une chose — en faire une technologie pratique en est une autre.\n\nLa plupart des innovations ne naissent pas de rien. Elles viennent de l'échange d'idées, de l'emprunt, du contact avec les cultures voisines. Plus les voisins diffèrent, plus on peut adopter de solutions.\n\nCe n'est pas suffisant. Le développement technologique exige bien des conditions : une longue vie pour apprendre, une main-d'œuvre coûteuse pour encourager la mécanisation, l'éducation et des lois qui protègent les inventeurs.\n\nIl se trouve que les institutions d'une société façonnent le développement technologique autant que la curiosité humaine."
    },
    "8": {
        "introText": "Nous voici aux mille dernières années. Dans notre récit, les humains sont passés de petites communautés sédentaires à de grands États armés de technologies modernes.\n\nLe pouvoir a accompagné ce voyage, bien qu'en coulisses. Tout a commencé par des groupes de parenté d'une cinquantaine de personnes, unis par le sang. Puis sont venues les tribus. Des centaines de personnes, parmi lesquelles des rôles non productifs — artisans et chefs.\n\nPuis les chefferies. Des regroupements de dizaines de milliers de personnes. Les gens ont commencé à vivre aux côtés d'étrangers, et il a fallu un système de gouvernement pour maintenir l'ordre.\n\nPuis les États — de vastes structures gouvernant des millions de personnes par une bureaucratie complexe. Dans ce dernier millénaire, le facteur décisif sera les institutions du pouvoir.",
        "zoneTexts": {
            "1": "Les frontières naturelles ont rendu la civilisation de Montagne Orange distincte, mais un grand nombre de voisins a aidé à développer la gouvernance.\n\nMalgré un isolement relatif, ce centre est devenu l'un des plus avancés — même si pas par le chemin le plus rapide.",
            "2": "L'abondance de voisins a forcé Vallée Bleue à apprendre tôt que la taille de la population, c'est le pouvoir. Pour se défendre et grandir, il a fallu créer des systèmes de gouvernance au service de toute la société, pas seulement de l'élite.\n\nEt maintenant, dans ce dernier millénaire, ces efforts portent leurs fruits.",
            "3": "Un long isolement et le manque de voisins ont beaucoup retardé l'émergence d'institutions étatiques.\n\nÊtre coupé des routes commerciales mondiales a permis un développement calme longtemps, mais pas aussi rapide que dans d'autres centres.",
            "4": "L'isolement a protégé Rivière Verte des épidémies, mais il a aussi ralenti le développement technologique et des institutions de gouvernance.\n\nLa bureaucratie s'est tout de même formée, plus tard qu'ailleurs, ce qui a permis à l'État de se développer de façon durable.",
            "5": "La géographie a forcé ce centre à créer tôt des institutions de pouvoir efficaces. Certains des premiers bureaucrates sont apparus ici, et un riche cercle de voisins a permis d'adopter les meilleures pratiques.\n\nC'est dans ce millénaire que ces avantages accumulés joueront à plein."
        },
        "preChoiceText": "Les grands dirigeants, penseurs et réformateurs façonnent l'histoire autant que les inventeurs.\n\nOù apparaîtront les chefs les plus sages ?",
        "postChoiceText": "Pendant des millénaires ont existé des communautés de parenté et tribales. Elles différaient par la taille, la densité et le degré de sédentarisation.\n\nIl y a environ 7 500 ans sont apparues les chefferies : de vastes regroupements où les gens ont appris à vivre aux côtés d'étrangers. Le chef a gagné le droit d'utiliser la force, de trancher les conflits et d'allouer les ressources.\n\nMais trop dépendait du caractère du chef. Il pouvait servir la société ou tout faire pour lui et son élite. Il existait des moyens de consolider le pouvoir : désarmer la population, renforcer l'élite, construire des projets grandioses, créer une religion ou une idéologie.\n\nPlus tard, il y a environ 6 000 ans, sont apparus les premiers États — bien plus stables et efficaces. Ils étaient dirigés par une classe de bureaucrates professionnels chargés d'allouer les ressources et de maintenir l'ordre.\n\nCe système a permis de gouverner des millions de personnes, de mener de vastes entreprises et de construire des armées puissantes. Ce sont les États qui sont devenus la forme de pouvoir qui a façonné le reste de l'histoire humaine."
    },
}

# Japanese rounds 1-8
JA_ROUNDS = {
    "1": {
        "introText": "始まりからいきましょう。およそ8,000年前。\n\n何十万年ものあいだ、人類は惑星に広がり、少しずつ新しい土地に定住してきました。ある時、その長い旅は終わりを迎えました。未来の文明の最初の中心が現れたのです。\n\nもちろん五つより多くありましたが、この五つを追い、8,000年にわたってどのように発展するか見ていきましょう。一手 — 一千年。\n彼らの成功か失敗は、出発時の条件とあなたの選択にかかっています。地図は想像上の簡略化されたもので、実在の地理からのネタバレはありません。彼らに会いましょう。",
        "zoneTexts": {
            "1": "最初の中心、オレンジマウンテンは高い山々に囲まれて世界から隔てられている。ここへ来るのは難しい。大型動物も有用な植物も豊富だ。隔離のおかげで部族は少なく、土地は十分にある。",
            "2": "第二の地域、ブルーバレーは大型動物に恵まれた広大な領土だ。ここでは食用植物より肉の方がはるかに多い。多くの部族がこの地域に住み、争いは日常茶飯事だ。",
            "3": "第三の地域、イエロージャングルは別の大陸にある。大型動物は少ないが植物は豊富。孤立した地域で独自に発展しており、人はあまり住んでいない。",
            "4": "第四の中心、グリーンリバーは第三の大きな大陸にある。気候は穏やかで、捕食者は少なく、食用植物は豊富 — 多くの部族が引き寄せられたのも不思議ではない。",
            "5": "第五の地域、レッドクレセント — 多くの部族が隣り合わせに暮らす広い肥沃な土地。大型動物は多いが、有用な植物はそれほど多くない。"
        },
        "preChoiceText": "この物語は受け身ではない — あなたがその流れを変えられる。どうやって？ あなたが歴史の「ワイルドカード」、偶然を操る。\n\nどこに最初に画期的なアイデアが現れるか、人々を他よりうまくまとめられる才能ある指導者がどこに生まれるか、あなたが決める。次の千年でどの中心が少しの優位を得るか？",
        "postChoiceText": "この千年で何が起きたか？\n\n未来の文明の中心は、遊牧から定住の暮らしへと移っていった。それぞれのペースで。何千年ものあいだ、遊牧民と定住民は隣り合わせに暮らした。定住への移行が最も速かったのは、植物が十分にあり、カロリーを安定して得られ、大型動物の減少が人々に持続可能な食料獲得の道を求めさせた場所だった。\n\n定住部族はより速く成長し発展した。生活はより予測しやすくなり、子供はより頻繁に生まれた — 二年に一度、遊牧民の四年に一度と比べて。やがて定住社会は数を増し、遊牧社会に取って代わった。"
    },
    "2": {
        "introText": "千年が過ぎた。五つの未来の文明の中心はすべて定住生活へ移っていた — 早い遅いはあったが。独自の指導者を持つ最初の大きな定住地が現れ始めた。しかしそれぞれはすぐに限界にぶつかった。\n\nさらなる成長に必要な肥沃な土地、植物、動物が単純に足りなかった。各中心がどう発展したか見ていこう。",
        "zoneTexts": {
            "1": "オレンジマウンテンは急速に発展した。ここでは早くから十分な植物を育てることを学び、大型動物が凶作の年を乗り切る助けになった。人々は徐々に定住の利点を理解していった。\n\n隣人は少なく、実験はやや少なめだったが、植物の豊富さが多くの試みを成功させた。",
            "2": "ブルーバレーは苦戦した。動物の豊富さがここでは他より長く遊牧生活を維持させた。隣人との衝突は頻繁だった。\n\nしかし以前は発展を妨げていた同じ要因が、今度はチャンスを提供する。ここでは植物は少ないが、多くの隣接部族が最良の品種を交換し、食料生産の成長を加速させられる。",
            "3": "別の大陸のイエロージャングルでは、大型動物 — 捕食者を含む — が少なかったおかげで人々は急速に拡大できた。植物の豊かさが定住への移行を容易にした。\n\n次の千年は穏やかに過ぎた。人々は様々な作物を試し、最良を選んだ。人口は急速に増えた。",
            "4": "グリーンリバーは繁栄した。植物は豊富で大型捕食者は少なく、定住への移行は速かった。\n\nここにも多くの部族がおり、新たな作物の交換 — 時には交易で平和的に、時には力で — が可能だった。",
            "5": "レッドクレセントはゆっくり発展した。動物の豊富さが人々を遊牧のままにし、多数の隣人が絶えぬ争いを生んだ。\n\n植物は少ないが、隣接部族のおかげで実験は増え、領土はゆっくりだが着実に広がった。"
        },
        "preChoiceText": "次の千年で、文明の中心は農業 — 様々な作物、農法、新技術 — によって成長する。\n\n試行錯誤で学んでいく。だが再び運がものを言う。誰が最初に最良の作物を発見するか？",
        "postChoiceText": "この千年で、人々は徐々に農耕を習得した。様々な作物を試し、最も頼りになる — 小麦や米のような — を選んだ。これが何千年も続く食の基盤となった。\n\n偶然が大きな役割を果たした。どの植物が手に入ったか、どれだけあったか、どれだけ栽培化が容易だったか。小麦は例えばリンゴの木よりはるかに簡単だった。\n\n徐々に農耕は狩猟より効率的になり、すべての社会が移行した。"
    },
    "3": {
        "introText": "さらに千年が過ぎた。すべての文明の中心は成長したが、それぞれ独自のやり方だった。最も効率的な作物を早く手に入れた者がより速く拡大した。しかし遅かれ早かれ、あらゆる技術には限界がある。一人が手で耕せる土地には最大限度がある。\n\n次の飛躍には、何か新しいもの — 鋤を引け、肉・乳・羊毛を提供できる手伝い役 — が必要だった。その手伝い役が家畜だった。\n\n各中心で何が起きたか見ていこう。",
        "zoneTexts": {
            "1": "オレンジマウンテンでは過去千年は成功だった。最良の作物は早く見つかり、土地は広がった。\n\nこの千年も有望だ。家畜に適した種が見つかるかもしれない大型動物が十分いる。",
            "2": "ブルーバレーでは食用植物の種類が乏しく発展は難しかった。隣人は肥沃な土地を奪おうと圧力をかけ続けた。\n\nだがこの千年はチャンスをもたらす。ここには大型動物が多く、一部は家畜化に適しているかもしれない。",
            "3": "イエロージャングルは着実に成長した。土地は広がり、最良の作物は豊富で、障害は自然の障壁 — 山と川 — だけだった。\n\n来る千年は厳しい。ここには大型動物がほとんどおらず、適した種を見つける可能性は非常に低い。",
            "4": "グリーンリバーではうまくいった。植物の豊かさが急速な成長を支え、隣人は邪魔しなかった。\n\n動物は話が別だ。数が少なく、適した種を見つけるのは難しい。",
            "5": "レッドクレセントではこの千年は厳しかった。植物は少なく、競争は激しい。\n\nだがここには大型動物が非常に多い。畜産に使う、肉用に飼う、運搬に使う — 幅広い可能性が開ける。"
        },
        "preChoiceText": "次の千年で、人々は動物の家畜化を始める。鋤を引き、肉や羊毛を提供し、輸送に使われる。\n\nだが家畜化の成功は常に運と動物の性質の組み合わせだ。おとなしい種もいればそうでない種もいる。飼育下で繁殖しない種、餌が多すぎる種もいる。今回はどの中心が運をつかむか？",
        "postChoiceText": "この千年で人類は多くの動物を家畜化し、それが畜産を一変させた。牛、羊、山羊、豚、馬が農業と日常生活の基盤となった。\n\nしかし成功には運が不可欠だった。すべての動物が家畜化に適しているわけではない。食性、成長速度、飼育下での繁殖能力、群れの行動、そしてもちろん気性がすべて重要だった。\n\n例えばシマウマは馬とほとんど違わないが、家畜化されなかった — 攻撃的すぎる。\n\n家畜は社会に大きな推進力を与えた。より多くの食料、衣料、輸送、新しい道具。それらは人類史の重要な一部となった。"
    },
    "4": {
        "introText": "動物の家畜化は、より大きな収穫とより予測可能な畜産への道を開いた。商人はより遠くへ行け、荷駄動物が重い荷を運び、交易とアイデアの交換が加速した。\n\nだがこの進歩は新たな問題を生んだ。情報が多すぎた。記憶では対応しきれず、知識を遠くに伝えることはほぼ不可能になった。この情報を記録する何かが発明されねばならなかった。そうして文字が現れた。\n\n各中心がどんな条件にあったか見ていこう。",
        "zoneTexts": {
            "1": "オレンジマウンテンではすべてが急速に発展した。動物は十分、収穫は良く、人口は増えている。\n\nだが自然の障壁 — かつて侵略者から守ってくれた同じ山と川 — が今は邪魔になる。交易は遅く、アイデアは届きにくい。",
            "2": "ブルーバレーでは、動物の多様さが食料生産の急速な伸びを可能にした。領土は広がり、隣人同士で交易しアイデアを共有した。\n\nここで文字が生まれる条件は最も整っている。記録すべきことは多く、取引相手も多く、情報を記録する明確な必要性がある。",
            "3": "イエロージャングルでは過去千年は苦しかった。動物はほとんどおらず、土地はまだ手で耕されている。\n\nここでは文字の必要性は薄く、隣人もさらに少ない。そんな条件で文字を発明するのは難しい。",
            "4": "グリーンリバーには大型動物が少ない — 安全という点では利点だった。だが収量を上げる段になると弱みになった。\n\nここでは交易が伸びており、隣人は敵というよりパートナーになりつつある。おそらく文字は借用によって現れるだろう。",
            "5": "レッドクレセントでは過去千年は成功だった。動物は早く家畜化され、交易は繁栄した。\n\n文字がここで生まれる見込みは高い — 需要も必要もあり、同じ方向で考え実験している隣人もいる。"
        },
        "preChoiceText": "次の千年で、文字はすべての文明の中心に現れるか、借用される。だが誰が最初にやるかが大きな優位になる。\n\nこのアイデアがどこで広がるか？",
        "postChoiceText": "文字は人類の歴史に一度か、わずか数回しか現れなかった。知る限り、最初はシュメール人、次にメキシコの先住民の間で。エジプトと中国の体系も独立して現れた可能性がある。\n\nはるかに多いのは、交換と交易を通じて文字が広がった場合だ。誰かが隣人の中でそれを見て、可能だと知りながら自分たちの体系を作り始めた。\n\n文字が根づくには資源が必要だった。書き、記録をつけられる書記、そして情報を蓄え伝える必要性。\n\nやがて文字は感情、歴史、文学の道具となった。"
    },
    "5": {
        "introText": "今や文字はすべての文明の中心で生活の一部になっている。ある場所では主に記録に使われ、別の場所ではすでに最初の書物が作られている。\n\n文明は強まり、広い領土を治めることを学び、互いにもっと交易するようになった。アイデア、植物、動物、技術を交換している。\n\nそしてここで、誰も選べない要因 — 大陸の地理 — が絵に入ってくる。誰がどんな状態でこの時点に達したか見ていこう。",
        "zoneTexts": {
            "1": "オレンジマウンテンでは文字は早く現れたが、隣人が少なかったため独特の形で発達した。\n\n今の焦点は交易とアイデアの交換だ。最も重要なのは大陸の形だ。南北に伸びているか東西か。それが植物と動物の広がりやすさを決める。",
            "2": "ブルーバレーでは文字は急速かつ成功裏に発達した。人々は知識を記録し伝えることを学んだ。\n\n東西に伸びた大陸は大きな利点がある。同じ緯度では気候が似ているので、植物を新たに適応させる必要がない。\n\n成長の条件はまずまず良い。",
            "3": "イエロージャングルでは文字は現れたが遅かった。切実な必要も、アイデアを借りるのに十分な隣人もいなかった。\n\n次の千年は難しい。大陸は南北に伸びているので、一歩ごとに新しい気候帯、新しい病気、新しい障害がある。",
            "4": "グリーンリバーは徐々に発展した。文字は広い領土の統治に役立った。\n\nだが自然の障壁 — 砂漠、山、海 — がアイデアの交換を妨げる。",
            "5": "レッドクレセントでは文明は急速に発展した。文字は早く現れたか、借用された。\n\n大陸は東西に伸びているので、長い距離で気候が似ている。それが交易と技術の普及に格好の機会を作る。"
        },
        "preChoiceText": "この千年、地理が決定的な役割を果たす — これまでの要因もまだ重要だが。\n\n商人が最も運をつかみ、隊商が最もよく隣人に届くのはどこか？",
        "postChoiceText": "大陸の向きは、発展の速度の差の主な理由の一つだ。東西に伸びた大陸では、気候帯が並行して走る。つまり一つの地域で育つ作物は、同じ緯度の別の地域にも根づきやすい。\n\n南北に伸びた大陸では、気候は温帯から亜熱帯、熱帯へと急に変わる。そうした変化は植物と動物の普及をはるかに難しくする。\n\n新しい気候帯ごとに、新しい植物、新しい動物、新しい技術が必要 — それはいつも簡単ではない。"
    },
    "6": {
        "introText": "地理は文明の発展に強い影響を与えた。だが今、人類は新たな挑戦に直面する — 以前の成功から生まれたもの。流行病だ。\n\n病気が流行病になるには、いくつかの条件が必要だ。最も重要なのは密集した都市と家畜との近さだ。都市人口の増加と都市間の交易の重要性が、病気の出現と拡散の理想的な経路を作った。",
        "zoneTexts": {
            "1": "オレンジマウンテンではすべてうまくいった。人口は増え、領土は広がった。\n\nだがここには流行病の条件が整っている。山と川は病気の拡散を多少遅らせるが、止めることはできない。",
            "2": "ブルーバレーでは過去千年は成功だった。交易は繁栄し、アイデアは広まった。\n\nだが今、密集した都市と忙しい交易路が、品物だけでなく病気ももたらす。",
            "3": "イエロージャングルはゆっくり成長したが、今それが利点になる。\n\nここには家畜も密集した集落も少ないので、流行病は根づきにくい。",
            "4": "グリーンリバーでは人口とアイデアの交換が成長した。海を越えた最初の接触が始まった。\n\n病気は現れるが、孤立のため他よりは少ない。それでも流行病を完全には避けられない。",
            "5": "過去千年はレッドクレセントの黄金時代だった。人口は増え、交易は繁栄した。\n\nだがまさにそれが地域を脆弱にする。巨大な人口と交易路の交差点に位置している。流行病はおそらくここで始まり、それらの道をたどって広がる。"
        },
        "preChoiceText": "再び選ぶ時だ。流行病を封じ込める方法を最初に理解する治療師や学者がどこに現れるか？",
        "postChoiceText": "流行病は戦争と同じくらい世界を変えた。ヨーロッパの病気は新世界でヨーロッパ人自身より多くの人を殺した。旧世界の病原菌は地元のものよりはるかに致命率が高く、ヨーロッパ人は免疫を持っていた。\n\nなぜか？ 多くの流行病は家畜に由来した。彼らも「密集病」に苦しみ、その一部が人間に広がった。\n\n動物を家畜化した瞬間、私たちは巨大な利点と深刻なリスクの両方を得た。だが後に、医学 — 特にワクチン — の発達が、人々に流行病を封じ込める手段を与えた。"
    },
    "7": {
        "introText": "私たちはほぼ現代に達した。流行病はある地域では多くの命を奪ったが、他はほとんど触れなかった。その「幸運な」側にも免疫はなく、将来さらなる苦難が待っている。\n\n今、発展の主なエンジンは技術だ。もちろんずっと進化してきたが、今になってようやく歴史の流れを形作り始めている。何かを発明するだけでは不十分 — 社会がそれを採用し、恩恵を得られなければならない。\n\n発明は個人の好奇心から生まれる。技術は、互いに支え合う多くの知識の蓄積から生まれる。例えば印刷機を作るには、一つのアイデアでは足りない — 紙、冶金、活字、インク、印刷機、そしてもちろん文字が必要だ。\n\n次の千年で私たちの中心がどう発展するか見ていこう。",
        "zoneTexts": {
            "1": "孤立はオレンジマウンテンが最悪の流行病を避ける助けになった。国境は間に合うように閉じられ、病気はほとんど入らなかった。\n\nだが今、その同じ孤立が障害になる。社会が隣人と交流しないと、技術は停滞する — 一時的に実用価値を失えば消えることすらある。",
            "2": "ブルーバレーでは流行病が多くの命を奪った。だが医学の発達も促した。寿命は延び、人々は実験と発見により多くの時間を持った。\n\nこの中心は技術進歩に恵まれた条件がある。多くの隣人、活発な交易、移住と文化の衝突を通じた絶え間ないアイデアの交換。",
            "3": "イエロージャングルは主要な交易路から遠いことが利いた。流行病はこの地域をほとんど襲わなかった。人口は増え、領土は広がった。\n\nだが隣人が少ないと借りられるアイデアも少ない。ある発明はここで生まれても、必要性の欠如のため広く広まらないかもしれない。",
            "4": "限られた交易がグリーンリバーを流行病の最悪の影響から守った。それでもいくつかの病気はここに達し、人口を減らした。\n\nそれでも技術成長の条件は良い。隣人は多くないが、いくつかの発明が根づき広がるには十分だ。",
            "5": "レッドクレセントでは過去千年は厳しかった。流行病が壊滅的な打撃を与え、人口と領土は縮小した。\n\nだがそれが人々に医学を発達させ、新しい解決策を求めることを強いた。今、交易が再び活気づくにつれ、この中心は他より速く発展できる。"
        },
        "preChoiceText": "選ぶ時だ。最も好奇心旺盛な学者がどこに現れるか？ 統治者が新しいアイデアに投資し、そこから利益を得るほど大胆になるのはどこか？",
        "postChoiceText": "技術はどこから来るか？\n\n発明したいという欲求は、どこでも人間の性質だ。だが何かを発明するのと、それを実用技術に変えるのは別だ。\n\nほとんどの革新はゼロからは現れない。アイデアの交換、借用、隣接文化との接触を通じて来る。隣人が互いに違うほど、採用できる解決策の幅は広い。\n\nそれだけではまだ足りない。技術発達には多くの条件が必要だ。学ぶための長い寿命。機械化の動機づけを作る高価な労働。発明者を守る教育と法。\n\n社会の制度が、人間の好奇心と同じくらい技術の発達を形作ることがわかる。"
    },
    "8": {
        "introText": "私たちは最後の千年に達した。物語のなかで、人類は小さな定住共同体から、現代技術を備えた大きな国家へと移ってきた。\n\n権力はこの旅にずっと付き添ってきたが、舞台裏にあった。血で結ばれた約50人の親族集団から始まった。次に部族が現れた。数百人の中に、すでに非生産的な役割 — 職人と指導者 — がいた。\n\n後に首長制が現れた。数万人の集団だ。人々は見知らぬ隣人と暮らし始め、秩序を保てる統治の仕組みが必要になった。\n\nそして国家が現れた — 複雑な官僚制で数百万人を治める巨大な構造だ。この最後の千年で、決定的な要因は権力の制度となる。",
        "zoneTexts": {
            "1": "自然の境界はオレンジマウンテンの文明を独特にしたが、多くの隣人が統治の発達を助けた。\n\n相対的な孤立にもかかわらず、この中心は最も進んだ一つになった — 最も速い道ではなかったが。",
            "2": "隣人の多さがブルーバレーに、人口の多さが力だと早く学ばせた。自らを守り成長するため、社会全体 — エリートだけでなく — に仕える統治の仕組みを作らねばならなかった。\n\nそして今、この最後の千年で、その努力が実を結んでいる。",
            "3": "長い孤立と隣人の欠如が、国家制度の出現を大きく遅らせた。\n\n世界の交易路から切り離されていたことで、長いあいだ穏やかに発展できたが、他の文明の中心ほど速くはなかった。",
            "4": "孤立はグリーンリバーを流行病から守ったが、技術と統治制度の発達も遅らせた。\n\n官僚制は結局、他より遅れたが形成され、国家の持続可能な発展を可能にした。",
            "5": "地理がこの文明の中心に、早くから効果的な権力の制度を作ることを強いた。最初の官僚の一部がここに現れ、豊かな隣人の輪が最良の慣行を採用することを可能にした。\n\nそしてこの千年で、それら蓄積した優位が十分に発揮される。"
        },
        "preChoiceText": "偉大な統治者、思想家、改革者は発明者と同じくらい歴史を形作る。\n\n最も賢い指導者はどこに現れるか？",
        "postChoiceText": "何千年ものあいだ、親族や部族の共同体が存在した。規模、人口密度、定住の度合いで異なった。\n\n約7,500年前に首長制が現れた。人々が初めて見知らぬ隣人と暮らすことを学んだ大きな集団だ。首長は力の使用、争いの解決、資源の配分の権利を得た。\n\nだが首長の性格に依存しすぎていた。社会に仕えることも、自分とエリートのためだけにすべてをすることもできた。権力を固める方法はあった。民の武装解除、エリートの強化、壮大なプロジェクト、宗教やイデオロギーの創出。\n\n後に、約6,000年前に最初の国家が現れた — はるかに安定し効率的だった。資源の配分と秩序の維持を担う専門官僚の階級が運営した。\n\nこの仕組みで数百万人を治め、巨大な課題に取り組み、強力な軍隊を築くことが可能になった。国家こそが、その後の人類史を形作った権力の形態となった。"
    },
}

# Spanish rounds 1-8 (intro/UI already in Spanish; rounds narrative was still in English)
ES_ROUNDS = {
    "1": {
        "introText": "¡Empecemos por el principio! Hace unos 8.000 años.\n\nDurante cientos de miles de años, los humanos se habían extendido por el planeta, asentándose poco a poco en nuevas tierras. En algún momento, ese largo viaje llegó a su fin. Surgieron los primeros centros de las futuras civilizaciones.\n\nPor supuesto, hubo más de cinco, pero seguiremos estos cinco y veremos cómo se desarrollan en 8.000 años. Un movimiento — mil años.\nSu éxito o fracaso dependerá de sus condiciones iniciales y de tus elecciones. Conozcámoslos.",
        "zoneTexts": {
            "1": "El primer centro, Montaña Naranja, está aislado del mundo por altas montañas. Llegar aquí es difícil. Es rico en grandes animales y plantas productivas. Gracias al aislamiento, hay menos tribus y tierra suficiente para todos.",
            "2": "La segunda región, Valle Azul, es un vasto territorio rico en grandes animales. Aquí hay mucho más carne que plantas comestibles. Muchas tribus viven en esta región y los conflictos entre ellas son frecuentes.",
            "3": "El tercer territorio, Junglas Amarillas, está en otro continente. Hay pocos grandes animales pero plantas en abundancia. Es una región aislada que se desarrolla por su cuenta y poca gente vive aquí.",
            "4": "El cuarto centro, Río Verde, está en un tercer gran continente. El clima es suave, hay pocos depredadores y plantas comestibles en abundancia — no es extraño que muchas tribus hayan sido atraídas aquí.",
            "5": "La quinta región, Creciente Rojo — amplias tierras fértiles donde muchas tribus conviven. Hay gran cantidad de grandes animales, pero las plantas útiles no son tan numerosas."
        },
        "preChoiceText": "Esta historia no será pasiva — puedes cambiar su curso. ¿Cómo? Controlarás el azar, la \"carta wild\" de la historia.\n\nTú decides dónde aparece primero una idea brillante, dónde nace un líder talentoso que puede unir a la gente mejor que otros. ¿Qué centro obtendrá una pequeña ventaja en el próximo milenio?",
        "postChoiceText": "¿Qué ocurrió en este milenio?\n\nLos centros de las futuras civilizaciones pasaron de una vida nómada a una sedentaria, cada uno a su ritmo. Durante milenios, nómadas y sedentarios convivieron. El paso al asentamiento fue más rápido donde había plantas suficientes, se podían obtener calorías de forma fiable y la pérdida de grandes animales empujó a la gente a buscar formas más sostenibles de conseguir alimento.\n\nLas tribus sedentarias crecieron y se desarrollaron más rápido. Sus vidas se volvieron más predecibles y los hijos nacían con más frecuencia — cada dos años, frente a una vez cada cuatro entre los nómadas. Con el tiempo, las sociedades sedentarias se volvieron más numerosas y desplazaron a las nómadas."
    },
    "2": {
        "introText": "Pasó un milenio. Los cinco centros de las futuras civilizaciones habían pasado a la vida sedentaria — unos antes, otros después. Empezaron a aparecer los primeros asentamientos grandes con sus propios líderes. Pero cada uno pronto tocó techo.\n\nSimplemente no había suficientes tierras fértiles, plantas y animales para seguir creciendo. Veamos cómo se desarrolló cada centro.",
        "zoneTexts": {
            "1": "Montaña Naranja se desarrolló rápido. Aquí aprendieron pronto a cultivar suficientes plantas, y los grandes animales les ayudaron a sobrevivir a los años malos. Fueron viendo las ventajas del asentamiento.\n\nCon pocos vecinos hubo algo menos de experimentos, pero la abundancia de plantas hizo que muchos intentos triunfaran.",
            "2": "Valle Azul lo tuvo difícil. La abundancia de animales mantuvo aquí la vida nómada más tiempo que en otros sitios. Los choques con vecinos eran frecuentes.\n\nPero los mismos factores que frenaban el desarrollo ahora ofrecen una oportunidad. Aquí escasean las plantas, pero muchas tribus vecinas permiten intercambiar las mejores variedades y acelerar la producción de alimentos.",
            "3": "En otro continente, en Junglas Amarillas, el escaso número de grandes animales — incluidos depredadores — permitió a la gente expandirse rápido. La riqueza de plantas hizo fácil el paso a la vida sedentaria.\n\nLos siguientes mil años pasaron en calma: la gente probó distintos cultivos y eligió los mejores. La población creció con rapidez.",
            "4": "Río Verde floreció: plantas en abundancia, pocos grandes depredadores y un paso rápido al asentamiento.\n\nAquí también hay muchas tribus, lo que permitió el intercambio de nuevos cultivos — a veces en paz por el comercio, a veces por la fuerza.",
            "5": "Creciente Rojo se desarrolló despacio. La abundancia de animales mantuvo a la gente en el nomadismo y los numerosos vecinos crearon conflicto constante.\n\nPero aunque las plantas escasean, los experimentos con ellas se multiplicaron gracias a las tribus vecinas. El territorio creció lento pero con firmeza."
        },
        "preChoiceText": "En el próximo milenio los centros de civilización crecerán gracias a la agricultura: distintos cultivos, métodos de cultivo y nuevas técnicas.\n\nAprenderán por prueba y error. Pero de nuevo todo depende de la suerte: ¿quién descubrirá primero el mejor cultivo?",
        "postChoiceText": "En este milenio la gente fue dominando poco a poco la agricultura. Probó distintos cultivos y eligió los más fiables — como el trigo o el arroz. Eso se convirtió en la base de su dieta durante miles de años.\n\nEl azar jugó un papel enorme. Qué plantas había, cuántas, lo fácil que era domesticarlas. El trigo fue mucho más fácil que, pongamos, los manzanos.\n\nPoco a poco la agricultura fue más eficiente que la caza — y todas las sociedades hicieron el cambio."
    },
    "3": {
        "introText": "Pasó otro milenio. Todos los centros de civilización crecieron, pero cada uno a su manera. Quienes obtuvieron antes los cultivos más eficientes se expandieron más rápido. Pero tarde o temprano toda tecnología toca techo. Hay un máximo de tierra que una persona puede cultivar a mano.\n\nPara el siguiente salto hacía falta algo nuevo — ayudantes que tiraran del arado, dieran carne, leche y lana. Esos ayudantes fueron los animales domésticos.\n\nVeamos qué pasó en cada centro.",
        "zoneTexts": {
            "1": "Los últimos mil años fueron un éxito para Montaña Naranja. Se encontraron pronto los mejores cultivos y la tierra se expandió.\n\nEste milenio también se presenta bien — hay suficientes grandes animales para que alguno pueda servir para la ganadería.",
            "2": "En Valle Azul el desarrollo fue duro por la escasa variedad de plantas comestibles. Los vecinos no dejaban de presionar, intentando apoderarse de tierras fértiles.\n\nPero este milenio trae una oportunidad. Aquí hay muchos grandes animales y algunos pueden ser aptos para la domesticación.",
            "3": "Junglas Amarillas crecieron con firmeza. La tierra se expandió, los mejores cultivos abundaban y los únicos obstáculos eran barreras naturales — montañas y ríos.\n\nLos próximos mil años serán duros. Aquí hay casi ningún gran animal y las probabilidades de encontrar especies aptas son muy bajas.",
            "4": "En Río Verde las cosas fueron bien. La riqueza de plantas aseguró un crecimiento rápido y los vecinos no estorbaron.\n\nCon los animales es distinto. Hay pocos y encontrar especies aptas será difícil.",
            "5": "Este milenio fue duro para Creciente Rojo. Pocas plantas, competencia fuerte.\n\nPero aquí hay muchísimos grandes animales. Eso abre muchas posibilidades — usarlos en la ganadería, criarlos para carne y usarlos para el transporte."
        },
        "preChoiceText": "En el próximo milenio la gente empezará a domesticar animales. Tirarán del arado, darán carne, lana y servirán de transporte.\n\nPero una domesticación con éxito es siempre una mezcla de suerte y rasgos del animal. Unos son dóciles, otros no; unos no se reproducen en cautividad, otros necesitan demasiada comida. ¿Qué centro tendrá suerte esta vez?",
        "postChoiceText": "En este milenio los humanos domesticaron muchos animales y eso transformó la ganadería. Vacas, ovejas, cabras, cerdos y caballos se convirtieron en la base de la agricultura y la vida cotidiana.\n\nPero el éxito era imposible sin suerte: no todo animal es apto para domesticar. La dieta, la tasa de crecimiento, la capacidad de reproducirse en cautividad, el comportamiento de rebaño y desde luego el temperamento importaban.\n\nPor ejemplo, las cebras apenas se diferencian de los caballos, pero nunca se domesticaron — son demasiado agresivas.\n\nLos animales domésticos dieron a las sociedades un gran impulso: más comida, más ropa, transporte y nuevas herramientas. Se convirtieron en una parte crucial de la historia humana."
    },
    "4": {
        "introText": "Domesticar animales abrió el camino a cosechas mayores y una ganadería más previsible. Los comerciantes pudieron viajar más lejos y los animales de carga llevaron pesos pesados, acelerando el comercio y el intercambio de ideas.\n\nPero ese progreso creó un problema nuevo: había demasiada información. La memoria ya no daba abasto y transmitir conocimiento a largas distancias se volvió casi imposible. Hubo que inventar algo para registrar esa información. Así apareció la escritura.\n\nVeamos qué condiciones tenía cada centro.",
        "zoneTexts": {
            "1": "En Montaña Naranja todo se desarrolló rápido. Animales suficientes, buenas cosechas, población creciente.\n\nPero las barreras naturales — las mismas montañas y ríos que antes protegían de invasores — ahora estorban. El comercio es más lento y las ideas llegan con más retraso.",
            "2": "En Valle Azul la gran variedad de animales permitió un rápido aumento de la producción de alimentos. El territorio creció y los vecinos comerciaron e intercambiaron ideas.\n\nLas condiciones para que surja aquí la escritura son las más favorables. Hay mucho que registrar, muchos socios comerciales y una necesidad clara de guardar información.",
            "3": "Junglas Amarillas lo pasaron mal en los últimos mil años. Casi no hay animales y la tierra se sigue cultivando a mano.\n\nAquí hay poca necesidad de escritura y aún menos vecinos. Inventar la escritura en esas condiciones es difícil.",
            "4": "En Río Verde hay pocos grandes animales — era una ventaja para la seguridad. Pero cuando tocó aumentar rendimientos se volvió una debilidad.\n\nAquí el comercio crece y los vecinos se vuelven cada vez más socios que enemigos. Tal vez la escritura aparezca por préstamo.",
            "5": "En Creciente Rojo los últimos mil años fueron un éxito. Los animales se domesticaron pronto y el comercio floreció.\n\nLa escritura tiene buenas posibilidades de surgir aquí — hay demanda, hay necesidad y hay vecinos que piensan en la misma línea y experimentan."
        },
        "preChoiceText": "En el próximo milenio la escritura aparecerá o se tomará prestada en todos los centros de civilización. Pero quien lo haga primero ganará una gran ventaja.\n\n¿En qué región prenderá esta idea?",
        "postChoiceText": "La escritura surgió en la historia humana solo una o pocas veces. Que sepamos, primero entre los sumerios, luego entre los pueblos indígenas de México. Los sistemas egipcio y chino quizá surgieron también de forma independiente.\n\nMucho más a menudo la escritura se extendió por intercambio y comercio. Alguien la vio entre vecinos y empezó a crear su propio sistema, sabiendo ya que era posible.\n\nPara que la escritura echara raíz hacían falta recursos. Escribas que supieran escribir y llevar cuentas, y una necesidad de almacenar y transmitir información.\n\nY con el tiempo la escritura se convirtió en una herramienta para la emoción, la historia y la literatura."
    },
    "5": {
        "introText": "Para entonces la escritura ya formaba parte de la vida en todos los centros de civilización. En unos sitios se usa sobre todo para llevar cuentas, en otros ya se crean los primeros libros.\n\nLas civilizaciones se han fortalecido, han aprendido a gobernar grandes territorios y comercian cada vez más entre sí. Intercambian ideas, plantas, animales y tecnologías.\n\nY aquí entra en escena un factor que nadie elige — la geografía del continente. Veamos quién ha llegado a este punto y en qué estado.",
        "zoneTexts": {
            "1": "En Montaña Naranja la escritura apareció pronto, aunque se desarrolló de forma peculiar por el escaso número de vecinos.\n\nAhora el foco está en el comercio y el intercambio de ideas. Lo que más importa es la forma del continente: si se alarga de norte a sur o de este a oeste. Eso determina lo fácil que es que se extiendan plantas y animales.",
            "2": "En Valle Azul la escritura se desarrolló rápido y con éxito. La gente aprendió a registrar conocimiento y transmitirlo.\n\nLos continentes alargados de este a oeste tienen una gran ventaja: el clima es parecido a la misma latitud, así que las plantas no tienen que adaptarse de nuevo.\n\nLas condiciones de crecimiento se ven bastante bien.",
            "3": "La escritura apareció en Junglas Amarillas, pero tarde. No había una necesidad urgente ni suficientes vecinos para tomar prestada la idea.\n\nLos próximos mil años serán difíciles. El continente se alarga de norte a sur, así que a cada paso hay una nueva zona climática, nuevas enfermedades y nuevos obstáculos.",
            "4": "Río Verde se desarrolló de forma gradual. La escritura ayudó a gobernar grandes territorios.\n\nPero las barreras naturales — desiertos, montañas, océanos — dificultan el intercambio de ideas.",
            "5": "En Creciente Rojo la civilización se desarrolló rápido. La escritura apareció pronto o se tomó prestada.\n\nEl continente se alarga de este a oeste, así que el clima es parecido a largas distancias. Eso crea excelentes oportunidades para el comercio y la difusión de la tecnología."
        },
        "preChoiceText": "En este milenio la geografía juega un papel decisivo — aunque todos los factores anteriores siguen importando.\n\n¿Dónde tendrán los comerciantes mejor suerte y sus caravanas llegarán más a menudo a los vecinos?",
        "postChoiceText": "La orientación de los continentes es una de las razones clave de las diferencias en el ritmo de desarrollo. En continentes alargados de este a oeste, las zonas climáticas van en paralelo. Eso significa que los mismos cultivos que crecen en una región pueden echar raíz con facilidad en otra a la misma latitud.\n\nEn continentes alargados de norte a sur, en cambio, el clima cambia de golpe: de templado a subtropical y tropical. Esos cambios hacen mucho más difícil extender plantas y animales.\n\nEn cada nueva zona climática hacen falta nuevas plantas, nuevos animales y nuevas técnicas — y no siempre es fácil."
    },
    "6": {
        "introText": "La geografía influyó mucho en el desarrollo de las civilizaciones. Pero ahora la humanidad se enfrenta a un reto nuevo — uno que nació del éxito anterior. Las epidemias.\n\nPara que una enfermedad se convierta en epidemia hacen falta varias condiciones. Las más importantes son ciudades densas y cercanía al ganado. El crecimiento de la población urbana y la importancia del comercio entre ciudades crearon vías ideales para que surgieran y se extendieran las enfermedades.",
        "zoneTexts": {
            "1": "En Montaña Naranja todo fue bien. La población creció, los territorios se expandieron.\n\nPero aquí se dan las condiciones para epidemias. Las montañas y los ríos frenarán un poco la propagación de la enfermedad, pero no la detendrán.",
            "2": "Los últimos mil años fueron un éxito para Valle Azul. El comercio floreció, las ideas circularon.\n\nPero ahora las ciudades densas y las rutas comerciales ocupadas traerán no solo bienes sino también enfermedad.",
            "3": "Junglas Amarillas crecieron despacio, pero ahora eso se vuelve una ventaja.\n\nAquí hay poco ganado y pocos asentamientos densos, así que a las epidemias les costará más afianzarse.",
            "4": "En Río Verde crecieron la población y el intercambio de ideas. Empezaron los primeros contactos al otro lado del océano.\n\nAparecerán enfermedades, pero serán menos que en otros sitios por el aislamiento. Aun así no se pueden evitar del todo las epidemias.",
            "5": "Los últimos mil años fueron una edad de oro para Creciente Rojo. La población creció, el comercio floreció.\n\nPero eso es justo lo que hace ahora vulnerable a la región: una población enorme y una posición en el cruce de las rutas comerciales. Lo más probable es que las epidemias empiecen aquí y luego sigan esas rutas."
        },
        "preChoiceText": "Es hora de elegir de nuevo. ¿Dónde aparecerá un sanador o un sabio que entienda antes que nadie cómo contener las epidemias?",
        "postChoiceText": "Las epidemias cambiaron el mundo tanto como las guerras. Las enfermedades europeas mataron a más gente en el Nuevo Mundo que los propios europeos. Los gérmenes del Viejo Mundo resultaron mucho más mortíferos que los locales, y los europeos tenían inmunidad.\n\n¿Por qué? Muchas epidemias surgieron de los animales domésticos. Ellos también padecían \"enfermedades del hacinamiento\" y algunas pasaron al hombre.\n\nEn cuanto domesticamos animales, ganamos ventajas enormes y riesgos serios. Pero más tarde el desarrollo de la medicina, sobre todo las vacunas, dio a la gente herramientas para contener las epidemias."
    },
    "7": {
        "introText": "Casi hemos llegado a nuestro tiempo. Las epidemias se llevaron muchas vidas en unas regiones pero apenas tocaron otras. Aunque esos \"afortunados\" tampoco tienen inmunidad y les esperan más problemas.\n\nAhora el motor principal del desarrollo es la tecnología. Siempre ha ido evolucionando, claro, pero solo ahora está empezando a marcar el rumbo de la historia. Inventar algo no basta — la sociedad tiene que poder adoptarlo y beneficiarse.\n\nLos inventos nacen de la curiosidad de individuos. Las tecnologías, en cambio, vienen de la acumulación de muchos saberes que se alimentan entre sí. Para crear la imprenta, por ejemplo, no basta una idea — hacen falta papel, metalurgia, tipos móviles, tinta, prensas y por supuesto escritura.\n\nVeamos cómo se desarrollarán nuestros centros en el próximo milenio.",
        "zoneTexts": {
            "1": "El aislamiento ayudó a Montaña Naranja a evitar las peores epidemias. Se cerraron a tiempo las fronteras y la enfermedad casi no entró.\n\nPero ahora ese mismo aislamiento se vuelve un obstáculo. Cuando una sociedad no interactúa con vecinos, la tecnología se estanca — o hasta desaparece si pierde valor práctico de forma temporal.",
            "2": "Las epidemias costaron muchas vidas en Valle Azul. Pero también impulsaron el desarrollo de la medicina. Subió la esperanza de vida y la gente tuvo más tiempo para experimentar y descubrir.\n\nEste centro tiene excelentes condiciones para el progreso tecnológico: muchos vecinos, comercio activo e intercambio constante de ideas por migración y choque de culturas.",
            "3": "Junglas Amarillas se beneficiaron de estar lejos de las principales rutas comerciales. Las epidemias apenas tocaron la región. La población creció, el territorio se expandió.\n\nPero pocos vecinos significan menos ideas que tomar prestadas. Puede que aquí surjan inventos que nunca se extiendan por falta de necesidad.",
            "4": "Un comercio limitado protegió a Río Verde de los peores efectos de las epidemias. Aun así algunas enfermedades llegaron y redujeron la población.\n\nSin embargo las condiciones para el crecimiento tecnológico son buenas. No hay muchos vecinos, pero suficientes para que algunos inventos echen raíz y se extiendan.",
            "5": "En Creciente Rojo los últimos mil años fueron duros. Las epidemias asestaron un golpe terrible; población y territorio se redujeron.\n\nPero eso obligó a la gente a desarrollar la medicina y buscar soluciones nuevas. Ahora que el comercio revive, este centro puede desarrollarse más rápido que otros."
        },
        "preChoiceText": "Es hora de elegir. ¿Dónde aparecerán los sabios más curiosos? ¿Dónde se atreverán los gobernantes a invertir en ideas nuevas y sacar provecho?",
        "postChoiceText": "¿De dónde vienen las tecnologías?\n\nEl afán de inventar es un rasgo humano en todas partes. Pero inventar algo es una cosa — convertirlo en tecnología práctica es otra.\n\nLa mayoría de las innovaciones no surgen de la nada. Llegan por el intercambio de ideas, por préstamos, por el contacto con culturas vecinas. Cuanto más se diferencian los vecinos, más amplio es el abanico de soluciones que se pueden adoptar.\n\nEso tampoco basta. El desarrollo tecnológico exige muchas condiciones. Vidas largas para aprender. Trabajo costoso para crear un incentivo a la mecanización. Educación y leyes que protejan a los inventores.\n\nResulta que las instituciones de una sociedad moldean el desarrollo de la tecnología tanto como la curiosidad humana."
    },
    "8": {
        "introText": "Hemos llegado a los últimos mil años. A lo largo de nuestra historia, los humanos pasaron de pequeñas comunidades sedentarias a grandes Estados armados con tecnología moderna.\n\nEl poder ha acompañado todo el viaje, aunque en segundo plano. Empezó con grupos de parentesco de unas cincuenta personas unidas por la sangre. Luego vinieron las tribus. Cientos de personas entre las que ya había roles no productivos — artesanos y líderes.\n\nDespués vinieron los cacicazgos. Asociaciones de decenas de miles. La gente empezó a vivir junto a desconocidos y necesitaban un sistema de gobierno que mantuviera el orden.\n\nLuego vinieron los Estados — estructuras enormes que gobiernan a millones mediante una burocracia compleja. En estos últimos mil años el factor decisivo serán las instituciones del poder.",
        "zoneTexts": {
            "1": "Las fronteras naturales hicieron distintiva a la civilización de Montaña Naranja, pero un gran número de vecinos ayudó a desarrollar el gobierno.\n\nA pesar del aislamiento relativo, este centro llegó a ser uno de los más avanzados — aunque no por la vía más rápida.",
            "2": "La abundancia de vecinos obligó a Valle Azul a aprender pronto que el tamaño de la población es poder. Para defenderse y crecer tuvieron que crear sistemas de gobierno al servicio de toda la sociedad, no solo de su élite.\n\nY ahora, en estos últimos mil años, esos esfuerzos están dando fruto.",
            "3": "Un largo aislamiento y la falta de vecinos retrasaron mucho la aparición de instituciones estatales.\n\nEstar desconectado de las rutas comerciales globales permitió un desarrollo tranquilo durante mucho tiempo, pero no tan rápido como en otros centros de civilización.",
            "4": "El aislamiento protegió a Río Verde de las epidemias, pero también ralentizó el desarrollo de la tecnología y las instituciones de gobierno.\n\nLa burocracia sí se formó al final, más tarde que en otros sitios, lo que permitió al Estado desarrollarse de forma sostenible.",
            "5": "La geografía obligó a este centro de civilización a crear pronto instituciones de poder eficaces. Algunos de los primeros burócratas aparecieron aquí y un círculo rico de vecinos les permitió adoptar las mejores prácticas.\n\nY es en este milenio cuando esas ventajas acumuladas entrarán en juego por completo."
        },
        "preChoiceText": "Los grandes gobernantes, pensadores y reformadores moldean la historia tanto como los inventores.\n\n¿Dónde aparecerán los líderes más sabios?",
        "postChoiceText": "Durante milenios existieron comunidades de parentesco y tribales. Se diferenciaban en tamaño, densidad de población y grado de asentamiento.\n\nHace unos 7.500 años aparecieron los cacicazgos. Eran grandes asociaciones donde la gente aprendió por primera vez a vivir junto a desconocidos. El cacique obtuvo el derecho a usar la fuerza, resolver disputas y asignar recursos.\n\nPero demasiado dependía del carácter del cacique. Podía servir a la sociedad o hacerlo todo para sí y su élite. Había formas de afianzar el poder: desarmar a la población, reforzar la élite, construir proyectos grandiosos, crear religión o ideología.\n\nMás tarde, hace unos 6.000 años, aparecieron los primeros Estados — mucho más estables y eficientes. Los dirigía una clase de burócratas profesionales encargados de asignar recursos y mantener el orden.\n\nEse sistema permitió gobernar a millones, abordar tareas enormes y construir ejércitos poderosos. Fueron los Estados la forma de poder que modeló el resto de la historia humana."
    },
}

def main():
    # French
    fr_path = os.path.join(ROOT, "public", "data", "texts_fr.json")
    with open(fr_path, "r", encoding="utf-8") as f:
        fr_data = json.load(f)
    for rnum, rdata in FR_ROUNDS.items():
        fr_data["rounds"][rnum] = rdata
    with open(fr_path, "w", encoding="utf-8") as f:
        json.dump(fr_data, f, ensure_ascii=False, indent=2)
    print("French rounds 3-8 applied.")

    # Japanese
    ja_path = os.path.join(ROOT, "public", "data", "texts_ja.json")
    with open(ja_path, "r", encoding="utf-8") as f:
        ja_data = json.load(f)
    for rnum, rdata in JA_ROUNDS.items():
        ja_data["rounds"][rnum] = rdata
    with open(ja_path, "w", encoding="utf-8") as f:
        json.dump(ja_data, f, ensure_ascii=False, indent=2)
    print("Japanese rounds applied.")

    # Spanish
    if ES_ROUNDS:
        es_path = os.path.join(ROOT, "public", "data", "texts_es.json")
        with open(es_path, "r", encoding="utf-8") as f:
            es_data = json.load(f)
        for rnum, rdata in ES_ROUNDS.items():
            es_data["rounds"][rnum] = rdata
        with open(es_path, "w", encoding="utf-8") as f:
            json.dump(es_data, f, ensure_ascii=False, indent=2)
        print("Spanish rounds applied.")

if __name__ == "__main__":
    main()
