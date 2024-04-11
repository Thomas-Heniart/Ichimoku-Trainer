import { FormEventHandler, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../../../store/reduxStore";
import { symbolsVM } from "../view-models-generators/symbols/symbols-vm";
import { retrieveSymbols } from "../../../../hexagon/use-cases/retrieve-symbols/retrieve-symbols";

export const TrainingConfigComponent = () => {
  const dispatch = useDispatch<AppDispatch>();
  const symbols = useSelector(symbolsVM);

  useEffect(() => {
    dispatch(retrieveSymbols()).catch((e) => {
      console.error(e);
    });
  }, []);

  const [symbol, setSymbol] = useState("");
  const [timeUnit, setTimeUnit] = useState("ST");
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const onSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    console.log(symbol);
    console.log(timeUnit);
    console.log(startDate);
  };

  return (
    <form onSubmit={onSubmit}>
      <label>
        Symbols:
        <select
          required={true}
          onChange={(e) => setSymbol(e.target.value)}
          value={symbol}
        >
          <option value={""}>Select one</option>
          {symbols.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <fieldset>
        <legend>Trading time unit:</legend>
        <label>
          <input
            type={"radio"}
            name={"timeUnit"}
            value={"ST"}
            checked={timeUnit === "ST"}
            onChange={(e) => setTimeUnit(e.target.value)}
          />
          Short term
        </label>
        <label>
          <input
            type={"radio"}
            name={"timeUnit"}
            value={"MT"}
            checked={timeUnit === "MT"}
            onChange={(e) => setTimeUnit(e.target.value)}
          />
          Mid term
        </label>
      </fieldset>
      <input
        type={"datetime-local"}
        required={true}
        value={formatDateForInput(startDate)}
        onChange={(e) => {
          const value = e.target.value;
          setStartDate(value ? new Date(value) : null);
        }}
      />
      <button type={"submit"}>Start training</button>
    </form>
  );
};

const formatDateForInput = (date: Date | null) => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};
