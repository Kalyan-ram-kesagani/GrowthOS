import { TrendingUp } from "lucide-react";
import Card from "./Card";

function Stat({ icon: Icon, label, value, sub }) {
  return (
    <Card className="stat">
      <div className="statTop">
        <span className="iconBox">
          <Icon size={20} />
        </span>

        <span className="up">
          <TrendingUp size={14} />
          growing
        </span>
      </div>

      <b>{value}</b>

      <p>{label}</p>

      <small>{sub}</small>
    </Card>
  );
}

export default Stat;