import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import IndexPage from "./Index";

global.fetch = jest.fn();

describe("IndexPage", () => {
  const renderComponent = () => {
    render(<IndexPage />);
  };

  beforeEach(() => {
    fetch.mockClear();
  });

  it("renders loading indicator initially", () => {
    renderComponent();
    const loadingIndicator = screen.getByRole("progressbar");
    expect(loadingIndicator).toBeInTheDocument();
  });

  it("displays no Pokémon found message when filtered list is empty", async () => {
    fetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({ results: [] }),
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/no Pokémon found/i)).toBeInTheDocument();
    });
  });

  it("handles input change correctly", async () => {
    renderComponent();
    const input = screen.getByPlaceholderText(/search for Pokémon/i);

    userEvent.type(input, "bulbasaur");

    // Wait for the input value to reflect
    await waitFor(() => {
      expect(input.value).toBe("bulbasaur");
    });
  });
});
