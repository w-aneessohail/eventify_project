import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Reviews = () => {
  const reviews = [
    {
      name: 'Sarah Johnson',
      avatar: 'https://i.pravatar.cc/150?img=1',
      rating: 5,
      date: '2 weeks ago',
      comment: 'Amazing experience! The ticket booking was smooth and I got the best seats for my favorite concert.',
    },
    {
      name: 'Michael Chen',
      avatar: 'https://i.pravatar.cc/150?img=2',
      rating: 5,
      date: '1 month ago',
      comment: "Best ticketing platform I've used. Great prices and excellent customer service.",
    },
    {
      name: 'Emma Williams',
      avatar: 'https://i.pravatar.cc/150?img=3',
      rating: 4,
      date: '3 weeks ago',
      comment: "Very satisfied with the service. The refund process was hassle-free when I couldn't attend.",
    },
    {
      name: 'David Martinez',
      avatar: 'https://i.pravatar.cc/150?img=4',
      rating: 5,
      date: '2 months ago',
      comment: 'Incredible platform! Managed to get tickets to a sold-out show through their waitlist feature.',
    },
    {
      name: 'Lisa Anderson',
      avatar: 'https://i.pravatar.cc/150?img=5',
      rating: 5,
      date: '1 week ago',
      comment: 'The installment payment option was a lifesaver. Highly recommend TICKETER!',
    },
    {
      name: 'James Wilson',
      avatar: 'https://i.pravatar.cc/150?img=6',
      rating: 4,
      date: '3 months ago',
      comment: 'Great selection of events and very user-friendly interface. Will definitely use again.',
    },
  ];

  return (
    
      <>

      {/* Header */}
      <section className="text-center py-16 border-b border-border">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl font-bold mb-4">Customer Reviews</h1>
          <p className="text-muted-foreground">See what our customers are saying about us</p>
          <div className="flex items-center justify-center space-x-2 mt-6">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="font-bold text-xl">4.8 out of 5</span>
            <span className="text-muted-foreground">({reviews.length} reviews)</span>
          </div>
        </motion.div>
      </section>

      {/* Reviews Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {reviews.map((review, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white p-8 rounded-2xl shadow-lg hover-lift"
            >
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src={review.avatar}
                  alt={review.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h3 className="font-bold">{review.name}</h3>
                  <p className="text-sm text-muted-foreground">{review.date}</p>
                </div>
              </div>
              
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < review.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              
              <p className="text-muted-foreground">{review.comment}</p>
            </motion.div>
          ))}
        </div>
      </section>

      </>
    
  );
};

export default Reviews;
