import type { Team } from "../types/tournament";

// FIFA/Coca-Cola Men's World Ranking — April 1, 2026 (pre-tournament edition)
export const teams: Team[] = [
    // Group A
    { id: "mex", groupId: "A", code: "MEX", name: "Mexico", flag: "🇲🇽", fifaRanking: 15 },
    { id: "rsa", groupId: "A", code: "RSA", name: "South Africa", flag: "🇿🇦", fifaRanking: 60 },
    { id: "kor", groupId: "A", code: "KOR", name: "South Korea", flag: "🇰🇷", fifaRanking: 25 },
    { id: "cze", groupId: "A", code: "CZE", name: "Czechia", flag: "🇨🇿", fifaRanking: 41 },

    // Group B
    { id: "can", groupId: "B", code: "CAN", name: "Canada", flag: "🇨🇦", fifaRanking: 30 },
    { id: "sui", groupId: "B", code: "SUI", name: "Switzerland", flag: "🇨🇭", fifaRanking: 19 },
    { id: "qat", groupId: "B", code: "QAT", name: "Qatar", flag: "🇶🇦", fifaRanking: 55 },
    { id: "bih", groupId: "B", code: "BIH", name: "Bosnia and Herzegovina", flag: "🇧🇦", fifaRanking: 64 },

    // Group C
    { id: "bra", groupId: "C", code: "BRA", name: "Brazil", flag: "🇧🇷", fifaRanking: 6 },
    { id: "mar", groupId: "C", code: "MAR", name: "Morocco", flag: "🇲🇦", fifaRanking: 8 },
    { id: "hai", groupId: "C", code: "HAI", name: "Haiti", flag: "🇭🇹", fifaRanking: 82 },
    { id: "sco", groupId: "C", code: "SCO", name: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", fifaRanking: 43 },

    // Group D
    { id: "usa", groupId: "D", code: "USA", name: "United States", flag: "🇺🇸", fifaRanking: 16 },
    { id: "par", groupId: "D", code: "PAR", name: "Paraguay", flag: "🇵🇾", fifaRanking: 40 },
    { id: "aus", groupId: "D", code: "AUS", name: "Australia", flag: "🇦🇺", fifaRanking: 27 },
    { id: "tur", groupId: "D", code: "TUR", name: "Türkiye", flag: "🇹🇷", fifaRanking: 22 },

    // Group E
    { id: "ger", groupId: "E", code: "GER", name: "Germany", flag: "🇩🇪", fifaRanking: 10 },
    { id: "cuw", groupId: "E", code: "CUW", name: "Curaçao", flag: "🇨🇼", fifaRanking: 83 },
    { id: "civ", groupId: "E", code: "CIV", name: "Côte d'Ivoire", flag: "🇨🇮", fifaRanking: 34 },
    { id: "ecu", groupId: "E", code: "ECU", name: "Ecuador", flag: "🇪🇨", fifaRanking: 24 },

    // Group F
    { id: "ned", groupId: "F", code: "NED", name: "Netherlands", flag: "🇳🇱", fifaRanking: 7 },
    { id: "jpn", groupId: "F", code: "JPN", name: "Japan", flag: "🇯🇵", fifaRanking: 18 },
    { id: "tun", groupId: "F", code: "TUN", name: "Tunisia", flag: "🇹🇳", fifaRanking: 46 },
    { id: "swe", groupId: "F", code: "SWE", name: "Sweden", flag: "🇸🇪", fifaRanking: 38 },

    // Group G
    { id: "bel", groupId: "G", code: "BEL", name: "Belgium", flag: "🇧🇪", fifaRanking: 9 },
    { id: "egy", groupId: "G", code: "EGY", name: "Egypt", flag: "🇪🇬", fifaRanking: 29 },
    { id: "irn", groupId: "G", code: "IRN", name: "Iran", flag: "🇮🇷", fifaRanking: 21 },
    { id: "nzl", groupId: "G", code: "NZL", name: "New Zealand", flag: "🇳🇿", fifaRanking: 85 },

    // Group H
    { id: "esp", groupId: "H", code: "ESP", name: "Spain", flag: "🇪🇸", fifaRanking: 2 },
    { id: "cpv", groupId: "H", code: "CPV", name: "Cabo Verde", flag: "🇨🇻", fifaRanking: 68 },
    { id: "ksa", groupId: "H", code: "KSA", name: "Saudi Arabia", flag: "🇸🇦", fifaRanking: 61 },
    { id: "uru", groupId: "H", code: "URU", name: "Uruguay", flag: "🇺🇾", fifaRanking: 17 },

    // Group I
    { id: "fra", groupId: "I", code: "FRA", name: "France", flag: "🇫🇷", fifaRanking: 1 },
    { id: "sen", groupId: "I", code: "SEN", name: "Senegal", flag: "🇸🇳", fifaRanking: 14 },
    { id: "nor", groupId: "I", code: "NOR", name: "Norway", flag: "🇳🇴", fifaRanking: 31 },
    { id: "irq", groupId: "I", code: "IRQ", name: "Iraq", flag: "🇮🇶", fifaRanking: 57 },

    // Group J
    { id: "arg", groupId: "J", code: "ARG", name: "Argentina", flag: "🇦🇷", fifaRanking: 3 },
    { id: "alg", groupId: "J", code: "ALG", name: "Algeria", flag: "🇩🇿", fifaRanking: 28 },
    { id: "aut", groupId: "J", code: "AUT", name: "Austria", flag: "🇦🇹", fifaRanking: 23 },
    { id: "jor", groupId: "J", code: "JOR", name: "Jordan", flag: "🇯🇴", fifaRanking: 63 },

    // Group K
    { id: "por", groupId: "K", code: "POR", name: "Portugal", flag: "🇵🇹", fifaRanking: 5 },
    { id: "uzb", groupId: "K", code: "UZB", name: "Uzbekistan", flag: "🇺🇿", fifaRanking: 50 },
    { id: "col", groupId: "K", code: "COL", name: "Colombia", flag: "🇨🇴", fifaRanking: 13 },
    { id: "cod", groupId: "K", code: "COD", name: "Congo DR", flag: "🇨🇩", fifaRanking: 45 },

    // Group L
    { id: "eng", groupId: "L", code: "ENG", name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", fifaRanking: 4 },
    { id: "cro", groupId: "L", code: "CRO", name: "Croatia", flag: "🇭🇷", fifaRanking: 11 },
    { id: "gha", groupId: "L", code: "GHA", name: "Ghana", flag: "🇬🇭", fifaRanking: 73 },
    { id: "pan", groupId: "L", code: "PAN", name: "Panama", flag: "🇵🇦", fifaRanking: 33 }
];