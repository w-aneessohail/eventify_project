import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Calendar, MapPin } from "lucide-react";
import { RoutePath } from "@/enum/routePath";
import {
  formatEventDate,
  getEventImageUrl,
  getOrganizerName,
} from "@/utils/mediaUrl";

const EventCard = ({ event, index = 0 }) => {
  const imageUrl = getEventImageUrl(event);
  const price = Number(event.ticketPrice || 0).toFixed(2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
    >
      <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover-lift">
        <div className="relative h-80 overflow-hidden">
          <img
            src={imageUrl}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>

        <div className="p-6">
          <h3 className="font-bold text-2xl mb-2">{event.title}</h3>
          <p className="text-muted-foreground mb-4">{getOrganizerName(event)}</p>

          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <MapPin size={16} className="mr-2" />
            <span>{event.address}</span>
          </div>

          <div className="flex items-center text-sm text-muted-foreground mb-4">
            <Calendar size={16} className="mr-2" />
            <span>{formatEventDate(event.eventDate)}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary">PKR {price}</span>
            <Link
              to={RoutePath.ATTENDEE_EVENT_DETAILS.replace(":id", event.id)}
            >
              <button className="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-accent transition-colors font-medium">
                View Details
              </button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EventCard;
