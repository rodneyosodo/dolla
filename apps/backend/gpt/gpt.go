package gpt

import (
	"context"
	"fmt"
	"os"
	"strings"

	openai "github.com/sashabaranov/go-openai"
	"github.com/tmc/langchaingo/documentloaders"
	"github.com/tmc/langchaingo/textsplitter"
)

type Service interface {
	ChatWithFile(ctx context.Context, token, filePath string) (string, error)
}

// GPT struct to get context from the given text.
type GPT struct {
	OpenAIClient *openai.Client
	Model        string
	Temperature  float64
	MaxTokens    int
	N            int
	Stop         interface{}
	MaxGPTTokens int
	TextSplitter textsplitter.RecursiveCharacter
	Prompt       string
	ChunkSize    int
	ChunkOverlap int
	OpenAITemp   float64
}

// NewGPT initializes the GPT struct.
func NewGPT(token string) (Service, error) {
	if token == "" {
		return nil, fmt.Errorf("OpenAI API Token is not given")
	}

	client := openai.NewClient(token)
	gpt := &GPT{
		OpenAIClient: client,
		Model:        "gpt-3.5-turbo-0613",
		Temperature:  0.3,
		MaxTokens:    256,
		N:            1,
		Stop:         nil,
		MaxGPTTokens: 2048,
		Prompt: `
		You are an experienced financial analyst and advisor.
		You are helping a client to understand their spending habits.
		Given monthly bank statement from this individual,
		Give an expense analysis report and budget recommendation for the statement.
		`,
		ChunkSize:    1000,
		ChunkOverlap: 200,
		OpenAITemp:   0,
	}
	gpt.TextSplitter = textsplitter.NewRecursiveCharacter(textsplitter.WithChunkSize(gpt.ChunkSize), textsplitter.WithChunkOverlap(gpt.ChunkOverlap))

	return gpt, nil
}

// ChatWithFile chats with the given file.
func (g *GPT) ChatWithFile(ctx context.Context, token, filePath string) (string, error) {
	if !strings.HasSuffix(filePath, ".pdf") {
		return "", fmt.Errorf("File is not a PDF")
	}

	f, err := os.Open(filePath)
	if err != nil {
		return "", err
	}
	defer os.Remove(filePath)
	finfo, err := f.Stat()
	if err != nil {
		return "", err
	}
	loader := documentloaders.NewPDF(f, finfo.Size())
	docs, err := loader.LoadAndSplit(ctx, g.TextSplitter)
	if err != nil {
		return "", fmt.Errorf("Failed to load document: %v", err)
	}

	var combinedDoc strings.Builder
	for _, doc := range docs {
		combinedDoc.WriteString(fmt.Sprintf("%s", doc.PageContent))
	}

	if len(combinedDoc.String()) > g.MaxGPTTokens {
		shortenedString := combinedDoc.String()[0:g.MaxGPTTokens]
		combinedDoc.Reset()
		combinedDoc.WriteString(shortenedString)
	}

	req := openai.ChatCompletionRequest{
		Model: g.Model,
		Messages: []openai.ChatCompletionMessage{
			{Role: "system", Content: g.Prompt},
			{Role: "user", Content: combinedDoc.String()},
		},
		Temperature: float32(g.Temperature),
	}
	res, err := g.OpenAIClient.CreateChatCompletion(ctx, req)
	if err != nil {
		return "", fmt.Errorf("Failed to get GPT response: %v", err)
	}

	return res.Choices[0].Message.Content, nil
}
