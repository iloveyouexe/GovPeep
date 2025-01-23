import { useSearchParams } from "react-router-dom";
import Monkee from "../assets/GbUlbBnWwAAdfTS.jpg"

const SearchResultsError = () => {
    const [searchParams] = useSearchParams();
    const zip = searchParams.get("zip");

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold">Search Results for ZIP Code: {zip} couldn't be found...</h1>
            <p>we're gonna send this monkey out to figure out the issue, report back l8r
                <img className="p-2" src={Monkee} alt="monkee style"/></p>
        </div>
    );
};

export default SearchResultsError;
