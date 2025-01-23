// TODO -  UNFUCK THIS
// AWFUL IDEA OF A SEARCH RESULTS PAGE
// ILL KEEP THE MONKEE THOUGH HES COOL

// import { useEffect, useState } from "react";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import agencyData from "../not_fake_cia_data/agencies.json";
//
// type Agency = {
//     id: number;
//     name: string;
//     type: string;
//     location: string;
//     zip: string;
// };
//
// const SearchResults = () => {
//     const [searchParams] = useSearchParams();
//     const zip = searchParams.get("zip");
//     const [agencies, setAgencies] = useState<Agency[]>([]);
//     const navigate = useNavigate();
//
//     useEffect(() => {
//         // Filter agencies by ZIP code
//         const matchingAgencies = agencyData.filter((agency) => agency.zip === zip);
//
//         if (matchingAgencies.length > 0) {
//             setAgencies(matchingAgencies);
//         } else {
//             // Redirect to error page if no matches
//             navigate("/error");
//         }
//     }, [zip, navigate]);
//
//     const groupedAgencies = agencies.reduce(
//         (groups, agency) => {
//             groups[agency.type] = [...(groups[agency.type] || []), agency];
//             return groups;
//         },
//         {} as Record<string, Agency[]>
//     );
//
//     return (
//         <div className="p-4">
//             <h1 className="text-2xl font-bold">Search Results for ZIP Code: {zip}</h1>
//             <div>
//                 {Object.entries(groupedAgencies).map(([category, agencyList]) => (
//                     <div key={category} className="my-4">
//                         <h2 className="text-xl font-semibold">{category} Agencies</h2>
//                         <ul className="pl-4">
//                             {agencyList.map((agency) => (
//                                 <li key={agency.id} className="my-2">
//                                     <div className="border p-4 rounded shadow">
//                                         <h3 className="font-bold">{agency.name}</h3>
//                                         <p className="text-sm text-gray-500">{agency.location}</p>
//                                     </div>
//                                 </li>
//                             ))}
//                         </ul>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// };
//
// export default SearchResults;
