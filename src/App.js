import { useEffect, useState } from 'react';
import './App.css';
import InfoBox from './components/InfoBox';
import { Card, CardContent, FormControl, MenuItem, Select } from '@material-ui/core';
import Table from './components/Table';
import { sortData, prettyPrintStat } from './components/util';
import numeral from "numeral";
import LineGraph from './components/LineGrpah';
import "leaflet/dist/leaflet.css";
import {Chart as chartjs} from 'chart.js/auto';



function App() {
  const [countries, setCountries] = useState([])
  const [country, setCountry] = useState('worldwide')
  const [countryInfo, setCountryInfo] = useState({})
  const [tableData, setTableData] = useState([])
  const [mapCountries, setMapCountries] = useState([])
  const [casesType, setCasesType] = useState("cases");
  useEffect(() => {
    const getData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
        .then(response => response.json())
        .then(data => {
          const countries = data.map(item => (
            {
              name: item.country,
              value: item.countryInfo.iso2
            }
          ))
          const sortedData = sortData(data)
          setTableData(sortedData)
          setMapCountries(data)
          setCountries(countries)
        })
    }
    getData()
  }, [])
  useEffect(() => {
    fetch('https://disease.sh/v3/covid-19/all')
      .then(response => response.json())
      .then(data => setCountryInfo(data))
  },[])
  const onCountryChange = async e => {
    const url = e.target.value === 'worldwide' ? 
    'https://disease.sh/v3/covid-19/all' : 
    `https://disease.sh/v3/covid-19/countries/${e.target.value}`

    await fetch(url)
      .then(response => response.json())
      .then(data => {
        console.log(data)
        setCountry(e.target.value)
        setCountryInfo(data)
        
      })
  }
  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1>COVID-19 tracker</h1>
          <FormControl className="app__dropdown">
            <Select variant="outlined" value={country} onChange={onCountryChange}>
              <MenuItem value="worldwide">Worldwide</MenuItem>
              {countries.map(country => <MenuItem value={country.value}>{country.name}</MenuItem>)}
            </Select>
          </FormControl>
        </div>
        <div className="app__stats">
          <InfoBox 
            onClick={(e) => setCasesType("cases")}
            title="Coronavirus Cases" 
            isBlue
            active={casesType === "cases"}
            cases={prettyPrintStat(countryInfo.todayCases)} 
            total={numeral(countryInfo.cases).format("0.0a")}
          />
          <InfoBox 
            onClick={(e) => setCasesType("recovered")}
            title="Recovered" 
            isGreen
            active={casesType === "recovered"}
            cases={prettyPrintStat(countryInfo.todayRecovered)} 
            total={numeral(countryInfo.recovered).format("0.0a")}
          />
          <InfoBox 
            onClick={(e) => setCasesType("deaths")}
            title="Deaths"
            active={casesType === "deaths"} 
            cases={prettyPrintStat(countryInfo.todayDeaths)} 
            total={numeral(countryInfo.deaths).format("0.0a")}
          />
        </div>
      </div>
      <Card className="app__right">
        <CardContent>
          <h3>Live Cases by Country</h3>
          <Table countries={tableData} />
          <h3 style={{ marginTop: '50px'}}>World wide  {casesType}</h3>
          <LineGraph casesType={casesType} />
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
