import { useState } from "react";
import { BarChart3, Plus, X, CheckCircle } from "lucide-react";

// Mock data for initial state - feel free to start with an empty array []
const initialPolls = [
  {
    id: 1,
    question: "Which frontend framework do you prefer for new projects?",
    author: "Jane Doe",
    avatar: "/avatars/jane.png",
    voted: false, // Simulates if the current user has voted
    options: [
      { text: "React", votes: 25 },
      { text: "Vue.js", votes: 15 },
      { text: "Svelte", votes: 12 },
      { text: "Angular", votes: 5 },
    ],
  },
  {
    id: 2,
    question: "What's the most important factor when choosing a new laptop?",
    author: "John Smith",
    avatar: "/avatars/john.png",
    voted: true, // Example of a poll the user has already voted on
    votedOptionIndex: 1, // The index the user voted for
    options: [
      { text: "Performance (CPU/RAM)", votes: 31 },
      { text: "Battery Life", votes: 45 },
      { text: "Screen Quality", votes: 18 },
      { text: "Portability & Weight", votes: 22 },
    ],
  },
];

export default function PollsPage() {
  const [polls, setPolls] = useState(initialPolls);
  const [newPollQuestion, setNewPollQuestion] = useState("");
  const [newPollOptions, setNewPollOptions] = useState(["", ""]);

  const handleOptionChange = (index: number, value: string) => {
    const updatedOptions = [...newPollOptions];
    updatedOptions[index] = value;
    setNewPollOptions(updatedOptions);
  };

  const addOption = () => {
    if (newPollOptions.length < 5) {
      setNewPollOptions([...newPollOptions, ""]);
    }
  };

  const removeOption = (index: number) => {
    if (newPollOptions.length > 2) {
      const updatedOptions = newPollOptions.filter((_, i) => i !== index);
      setNewPollOptions(updatedOptions);
    }
  };

  const handleCreatePoll = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      newPollQuestion.trim() === "" ||
      newPollOptions.some((opt) => opt.trim() === "")
    ) {
      alert("Please fill out the question and all option fields.");
      return;
    }

    const newPoll = {
      id: Date.now(),
      question: newPollQuestion,
      author: "Current User", // TODO: Replace with actual logged-in user
      avatar: "/avatars/you.png", // TODO: Replace with user's avatar
      voted: false,
      options: newPollOptions.map((opt) => ({ text: opt, votes: 0 })),
    };

    setPolls([newPoll, ...polls]);
    setNewPollQuestion("");
    setNewPollOptions(["", ""]);
  };

  const handleVote = (pollId: number, optionIndex: number) => {
    setPolls(
      polls.map((poll) => {
        if (poll.id === pollId && !poll.voted) {
          const updatedOptions = poll.options.map((option, index) => {
            if (index === optionIndex) {
              return { ...option, votes: option.votes + 1 };
            }
            return option;
          });
          return {
            ...poll,
            options: updatedOptions,
            voted: true,
            votedOptionIndex: optionIndex,
          };
        }
        return poll;
      })
    );
  };

  return (
    <section className="min-h-screen w-full bg-[#0a192f] text-white flex flex-col items-center py-10 px-4 sm:px-6">
      {/* Page Header */}
      <div className="flex flex-col my-6 items-center text-center">
        <h2 className="text-5xl md:text-6xl font-bold text-[#9cc9ff]">
          Community Polls
        </h2>
        <p className="text-gray-400 mt-2 max-w-2xl">
          Voice your opinion, see what the community thinks, and contribute to
          the conversation.
        </p>
      </div>

      <div className="max-w-7xl w-full mx-auto mt-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Create Poll Form */}
        <div className="lg:col-span-1">
          <form
            onSubmit={handleCreatePoll}
            className="bg-[#102a4e] p-6 rounded-2xl shadow-lg sticky top-10"
          >
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <BarChart3 className="text-[#9cc9ff]" />
              Create a New Poll
            </h3>
            <div className="flex flex-col gap-4">
              <textarea
                placeholder="What's your question?"
                className="w-full bg-[#1a2f55] border border-[#3e5a8a] text-white placeholder-gray-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5ea4ff] resize-none"
                rows={3}
                value={newPollQuestion}
                onChange={(e) => setNewPollQuestion(e.target.value)}
              />
              {newPollOptions.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`Option ${index + 1}`}
                    className="w-full bg-[#1a2f55] border border-[#3e5a8a] text-white placeholder-gray-400 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5ea4ff]"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                  />
                  {newPollOptions.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="p-2 text-gray-400 hover:text-red-500 transition"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addOption}
                disabled={newPollOptions.length >= 5}
                className="text-sm text-[#9cc9ff] hover:text-white transition self-start disabled:opacity-50 disabled:cursor-not-allowed"
              >
                + Add Option
              </button>
            </div>
            <button
              type="submit"
              className="mt-6 w-full flex items-center justify-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white p-3 rounded-full font-semibold transition"
            >
              <Plus size={20} /> Post Poll
            </button>
          </form>
        </div>

        {/* Active Polls Feed */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {polls.map((poll) => {
            const totalVotes = poll.options.reduce(
              (sum, option) => sum + option.votes,
              0
            );

            return (
              <div
                key={poll.id}
                className="bg-[#102a4e] rounded-2xl p-6 shadow-lg animate-fade-in-up"
              >
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={poll.avatar}
                    alt={poll.author}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="font-bold text-white">{poll.author}</p>
                    <p className="mt-1 text-lg text-gray-200">
                      {poll.question}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 mt-4">
                  {poll.options.map((option, index) => {
                    const percentage =
                      totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
                    const isVotedOption =
                      poll.voted && poll.votedOptionIndex === index;

                    return !poll.voted ? (
                      // Voting View
                      <button
                        key={index}
                        onClick={() => handleVote(poll.id, index)}
                        className="w-full text-left p-3 bg-[#1a2f55] border border-[#3e5a8a] rounded-lg hover:bg-[#254272] hover:border-[#5ea4ff] transition-all duration-200"
                      >
                        {option.text}
                      </button>
                    ) : (
                      // Results View
                      <div
                        key={index}
                        className="relative w-full p-3 bg-[#1a2f55] border border-[#3e5a8a] rounded-lg overflow-hidden"
                      >
                        <div
                          className="absolute top-0 left-0 h-full bg-[#2563eb] opacity-40"
                          style={{
                            width: `${percentage}%`,
                            transition: "width 0.5s ease-in-out",
                          }}
                        />
                        <div className="relative flex justify-between items-center font-semibold">
                          <span className="flex items-center gap-2">
                            {option.text}
                            {isVotedOption && (
                              <CheckCircle
                                size={16}
                                className="text-green-400"
                              />
                            )}
                          </span>
                          <span className="text-gray-300">
                            {percentage.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 text-right text-sm text-gray-500">
                  Total Votes: {totalVotes}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
